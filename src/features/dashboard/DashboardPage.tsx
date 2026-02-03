import React, { Suspense, useMemo, useState } from 'react';
import { DailyLog, MaintenanceItem, DashboardStats } from '../../types';
import { DashboardStatsCard } from './components/DashboardStatsCard';
import { HeroSection } from './components/HeroSection';
import { WeeklySummary } from './components/WeeklySummary';
import { StationAnalysis } from '../analytics';
import { PredictiveInsights } from '../insights';
import { SmartNudgeBanner } from '../../components/SmartNudgeBanner';
import { useSmartNudges } from '../../hooks/useSmartNudges';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, X, Lightbulb } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        logs, fuelPurchases, maintenanceItems, vehicleParts, vehicles, selectedVehicleId,
        yearFilter, setYearFilter, openModal
    } = useAppStore();

    // Dismissed alerts state
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
    const [dismissedTip, setDismissedTip] = useState(false);

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

    // Filter out dismissed alerts
    const visibleAlerts = activeAlerts.filter(a => !dismissedAlerts.has(a.id));

    // Smart Nudges
    const smartNudges = useSmartNudges({
        logs,
        purchases: fuelPurchases,
        maintenanceItems,
        vehicleParts,
        currentOdometer: lastOdometer,
        monthlyBudget: 0
    });

    // Daily tip
    const dailyTips = [
        "Lastik basıncını düzenli kontrol etmek yakıt tüketimini %3'e kadar azaltabilir.",
        "Ani fren ve hızlanmalardan kaçınmak hem güvenlik hem de tasarruf sağlar.",
        "Klima kullanımı yakıt tüketimini yaklaşık %10 artırır.",
        "Düzenli bakım araç ömrünü uzatır ve beklenmedik masrafları önler.",
        "Sabit hızda sürüş en verimli yakıt tüketimini sağlar."
    ];
    const todayTip = dailyTips[new Date().getDay() % dailyTips.length];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Akıllı Öneriler (Smart Insights) - MOVED TO TOP */}
            <Suspense fallback={<div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <PredictiveInsights
                    logs={logs}
                    purchases={fuelPurchases}
                    maintenanceItems={maintenanceItems}
                    currentOdometer={lastOdometer}
                    monthlyBudget={0}
                />
            </Suspense>

            {/* 2. Maintenance Alerts with Close Button - MOVED ABOVE TIP */}
            {visibleAlerts.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {visibleAlerts.map(alert => {
                        let remainingText = '';
                        let isCritical = false;
                        let targetText = '';

                        if (alert.type === 'date' && alert.dueDate) {
                            const days = Math.ceil((new Date(alert.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            isCritical = days < 0;
                            remainingText = isCritical ? `${Math.abs(days)} gün geçti!` : `${days} gün kaldı.`;
                            targetText = `Tarih: ${new Date(alert.dueDate).toLocaleDateString('tr-TR')}`;
                        } else if (alert.type === 'both' && alert.dueDate && alert.nextDueKm) {
                            const days = Math.ceil((new Date(alert.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const km = alert.nextDueKm - lastOdometer;
                            const daysUrgency = days * 100;

                            if (days < 0 || (km >= 0 && daysUrgency < km)) {
                                isCritical = days < 0;
                                remainingText = isCritical ? `${Math.abs(days)} gün geçti!` : `${days} gün kaldı.`;
                                targetText = `Tarih: ${new Date(alert.dueDate).toLocaleDateString('tr-TR')}`;
                            } else {
                                isCritical = km < 0;
                                remainingText = isCritical ? `${Math.abs(km).toLocaleString()} km gecikti!` : `${km.toLocaleString()} km kaldı.`;
                                targetText = `Hedef: ${alert.nextDueKm.toLocaleString()} km`;
                            }
                        } else {
                            const remaining = (alert.nextDueKm || 0) - lastOdometer;
                            isCritical = remaining < 0;
                            remainingText = isCritical ? `${Math.abs(remaining).toLocaleString()} km gecikti!` : `${remaining.toLocaleString()} km kaldı.`;
                            targetText = `Hedef: ${(alert.nextDueKm || 0).toLocaleString()} km`;
                        }

                        return (
                            <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'}`}>
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    {isCritical ? <AlertCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm uppercase truncate">{alert.title} Bakımı</h4>
                                        <p className="text-sm">{remainingText}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs font-bold px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full whitespace-nowrap hidden sm:inline">
                                        {targetText}
                                    </span>
                                    <button
                                        onClick={() => setDismissedAlerts(prev => new Set(prev).add(alert.id))}
                                        className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        title="Kapat"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 3. Daily Tip - with close button */}
            {!dismissedTip && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
                        <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1">Günün İpucu</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">{todayTip}</p>
                    </div>
                    <button
                        onClick={() => setDismissedTip(true)}
                        className="p-1.5 rounded-full hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-colors shrink-0"
                        title="Kapat"
                    >
                        <X className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                </div>
            )}

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

            {/* Stats Card - without alerts (moved above) */}
            <DashboardStatsCard stats={stats} currentOdometer={lastOdometer} />

            {/* Weekly/Monthly Summary */}
            <WeeklySummary logs={logs} fuelPurchases={fuelPurchases} />

            {/* Analytics Section */}
            <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <StationAnalysis fuelPurchases={fuelPurchases} />
            </Suspense>
        </div>
    );
};
