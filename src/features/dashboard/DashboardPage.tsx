import React, { Suspense, useMemo } from 'react';
import { GamificationCard } from '../gamification/components/GamificationCard';
import { BadgeList } from '../gamification/components/BadgeList';
import { StreakWidget } from '../gamification/components/StreakWidget';
import { DailyLog, MaintenanceItem, DashboardStats, Vehicle, FuelPurchase, VehiclePart } from '../../types';
import { DashboardStatsCard } from './components/DashboardStatsCard';
import { HeroSection } from './components/HeroSection';
import { WeeklySummary } from './components/WeeklySummary';
import { StationAnalysis } from '../analytics';
import { PredictiveInsights } from '../insights';
import { SmartNudgeBanner } from '../../components/SmartNudgeBanner';
import { useSmartNudges } from '../../hooks/useSmartNudges';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        logs, fuelPurchases, maintenanceItems, vehicleParts, vehicles, selectedVehicleId,
        yearFilter, setYearFilter, addLog, addFuelPurchase, openModal
    } = useAppStore();

    // Filter logs by selected vehicle
    const filteredLogs = useMemo(() => {
        if (!selectedVehicleId || selectedVehicleId === 'all') return logs;
        return logs.filter(log => !log.vehicleId || log.vehicleId === selectedVehicleId);
    }, [logs, selectedVehicleId]);

    const lastOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;

    // Calculate stats
    const stats: DashboardStats = useMemo(() => {
        const yearFilteredLogs = yearFilter === 'all'
            ? logs
            : logs.filter(l => new Date(l.date).getFullYear().toString() === yearFilter);

        const yearFilteredPurchases = yearFilter === 'all'
            ? fuelPurchases
            : fuelPurchases.filter(p => new Date(p.date).getFullYear().toString() === yearFilter);

        if (yearFilteredLogs.length === 0 && yearFilteredPurchases.length === 0) return { totalDistance: 0, totalCost: 0, avgCostPerKm: 0, avgConsumption: 0, lastFuelPrice: 0, totalLiters: 0 };

        const totalDistance = yearFilteredLogs.reduce((sum, log) => sum + log.dailyDistance, 0);
        const totalCost = yearFilteredLogs.reduce((sum, log) => sum + log.dailyCost, 0);

        const validLogs = yearFilteredLogs.filter(l => l.dailyFuelConsumed > 0 && l.dailyDistance > 0);
        const totalFuelConsumedLogs = validLogs.reduce((sum, log) => sum + log.dailyFuelConsumed, 0);
        const totalDistLogs = validLogs.reduce((sum, log) => sum + log.dailyDistance, 0);

        const avgConsumption = totalDistLogs > 0 ? (totalFuelConsumedLogs / totalDistLogs) * 100 : 0;

        let lastFuelPrice = 0;
        const lastLogAll = logs.length > 0 ? logs.reduce((prev, current) => new Date(prev.date) > new Date(current.date) ? prev : current) : null;
        const lastPurchaseAll = fuelPurchases.length > 0 ? fuelPurchases.reduce((prev, current) => new Date(prev.date) > new Date(current.date) ? prev : current) : null;

        if (lastLogAll && lastPurchaseAll) {
            lastFuelPrice = new Date(lastPurchaseAll.date) > new Date(lastLogAll.date) ? lastPurchaseAll.pricePerLiter : lastLogAll.fuelPrice;
        } else if (lastLogAll) {
            lastFuelPrice = lastLogAll.fuelPrice;
        } else if (lastPurchaseAll) {
            lastFuelPrice = lastPurchaseAll.pricePerLiter;
        }

        let weightedAvgPrice = 0;
        const totalSpent = yearFilteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalLiters = yearFilteredPurchases.reduce((sum, p) => sum + p.liters, 0);

        if (totalLiters > 0) {
            weightedAvgPrice = totalSpent / totalLiters;
        }

        return {
            totalDistance,
            totalCost,
            avgCostPerKm: totalDistance > 0 ? totalCost / totalDistance : 0,
            avgConsumption,
            lastFuelPrice,
            totalLiters,
            weightedAvgPrice
        };
    }, [logs, fuelPurchases, yearFilter]);

    const activeAlerts = useMemo(() => {
        const maintAlerts = maintenanceItems.filter(item => {
            let isDue = false;
            if (item.type === 'km' || item.type === 'both') {
                if (item.nextDueKm) {
                    const remainingKm = item.nextDueKm - lastOdometer;
                    if (remainingKm <= (item.notifyBeforeKm || 1000)) isDue = true;
                }
            }
            if (!isDue && (item.type === 'date' || item.type === 'both')) {
                if (item.dueDate) {
                    const today = new Date();
                    const due = new Date(item.dueDate);
                    const diffTime = due.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= Math.min((item.notifyBeforeDays || 15), 15)) isDue = true;
                }
            }
            return isDue;
        }).map(item => {
            let urgency = 999999;
            let displayRemaining = "";
            if (item.type === 'date' && item.dueDate) {
                const days = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                urgency = days * 100;
                displayRemaining = `${days} gün`;
            } else if (item.nextDueKm) {
                urgency = item.nextDueKm - lastOdometer;
                displayRemaining = `${urgency} km`;
            }
            return { ...item, urgency, displayRemaining };
        });

        const partAlerts = vehicleParts.filter(part => {
            if (!part.lifespanKm || !part.isActive) return false;
            const dueKm = part.installKm + part.lifespanKm;
            return (dueKm - lastOdometer) <= 1000;
        }).map(part => {
            const remaining = (part.installKm + part.lifespanKm!) - lastOdometer;
            return {
                id: part.id,
                title: `${part.name} (Parça)`,
                type: 'km',
                nextDueKm: part.installKm + part.lifespanKm!,
                notifyBeforeKm: 1000,
                status: 'warning',
                urgency: remaining,
                displayRemaining: `${remaining} km`
            } as MaintenanceItem & { urgency: number, displayRemaining: string };
        });

        return [...maintAlerts, ...partAlerts].sort((a, b) => a.urgency - b.urgency);
    }, [maintenanceItems, vehicleParts, lastOdometer]);

    // Smart Nudges
    const smartNudges = useSmartNudges({
        logs,
        purchases: fuelPurchases,
        maintenanceItems,
        vehicleParts,
        currentOdometer: lastOdometer,
        monthlyBudget: 0
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Smart Nudges Banner */}
            {smartNudges.length > 0 && (
                <SmartNudgeBanner
                    nudges={smartNudges}
                    onAction={(handler) => {
                        if (handler === 'addLog') openModal('entry');
                        else if (handler === 'addFuel') openModal('fuel');
                        else if (handler === 'maintenance') navigate('/maintenance');
                    }}
                    onDismiss={(id) => console.log('Dismissed:', id)}
                />
            )}

            {/* Year Filter Tabs */}
            <div className="flex justify-center items-center gap-4">
                <StreakWidget />
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {(['2026', '2025', 'all'] as const).map((year) => (
                        <button
                            key={year}
                            onClick={() => setYearFilter(year)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${yearFilter === year
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {year === 'all' ? 'Hepsi' : year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Section Preview */}
            <HeroSection
                logs={filteredLogs}
                fuelPurchases={fuelPurchases}
                vehicle={vehicles.find(v => v.id === selectedVehicleId)}
                onAddFuel={() => openModal('fuel')}
                onAddEntry={() => openModal('entry')}
            />

            <GamificationCard />

            <DashboardStatsCard stats={stats} alerts={activeAlerts} currentOdometer={lastOdometer} />

            <BadgeList />

            {/* Weekly/Monthly Summary */}
            <WeeklySummary logs={logs} fuelPurchases={fuelPurchases} />

            {/* Analytics Section */}
            <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>}>
                <StationAnalysis fuelPurchases={fuelPurchases} />
            </Suspense>

            {/* Predictive Insights */}
            <Suspense fallback={<div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>}>
                <PredictiveInsights
                    logs={logs}
                    purchases={fuelPurchases}
                    maintenanceItems={maintenanceItems}
                    currentOdometer={lastOdometer}
                    monthlyBudget={0}
                />
            </Suspense>
        </div>
    );
};
