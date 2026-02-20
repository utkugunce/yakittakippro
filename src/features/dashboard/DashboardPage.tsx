import React, { Suspense, useMemo } from 'react';
import { DashboardStats } from '../../types';
import { DashboardStatsCard } from './components/DashboardStatsCard';
import { HeroSection } from './components/HeroSection';
import { WeeklySummary } from './components/WeeklySummary';
import { StationAnalysis } from '../analytics';
import { PredictiveInsights } from '../insights';
import { SmartNudgeBanner } from '../../components/SmartNudgeBanner';
import { useSmartNudges } from '../../hooks/useSmartNudges';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { SmartInsightsWidget } from './components/SmartInsightsWidget';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DynamicBudgetSimulator } from './components/DynamicBudgetSimulator';
import { PredictiveForecaster } from './components/PredictiveForecaster';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        logs, fuelPurchases, maintenanceItems, vehicleParts, vehicles, selectedVehicleId,
        yearFilter, setYearFilter, openModal
    } = useAppStore();

    // Filter logs by selected vehicle
    const filteredLogs = useMemo(() => {
        if (!selectedVehicleId || selectedVehicleId === 'all') return logs;
        return logs.filter(log => !log.vehicleId || log.vehicleId === selectedVehicleId);
    }, [logs, selectedVehicleId]);

    const lastOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;

    // Calculate stats
    const stats: DashboardStats = useDashboardStats({
        logs,
        fuelPurchases,
        yearFilter
    });

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
            {/* 1. Bildirim Merkezi (Insights + Alerts + Tips) */}
            <Suspense fallback={<div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <PredictiveInsights
                    logs={logs}
                    purchases={fuelPurchases}
                    maintenanceItems={maintenanceItems}
                    vehicleParts={vehicleParts}
                    currentOdometer={lastOdometer}
                    monthlyBudget={0}
                />
            </Suspense>

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

            {/* Hero Section Preview */}
            <HeroSection
                logs={filteredLogs}
                fuelPurchases={fuelPurchases}
                vehicle={vehicles.find(v => v.id === selectedVehicleId)}
                onAddFuel={() => openModal('fuel')}
                onAddEntry={() => openModal('entry')}
            />

            {/* Year Filter Tabs */}
            <div className="flex justify-center items-center gap-4">
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {(['2026', '2025', 'all'] as const).map((year) => (
                        <button
                            key={year}
                            onClick={() => setYearFilter(year)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all min-h-[44px] touch-manipulation ${yearFilter === year
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {year === 'all' ? 'Hepsi' : year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Smart AI Insights */}
            <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <SmartInsightsWidget />
            </Suspense>

            {/* Predictive Forecaster */}
            <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <PredictiveForecaster
                    logs={logs}
                    maintenanceItems={maintenanceItems}
                    currentOdometer={lastOdometer}
                />
            </Suspense>

            {/* Stats Card */}
            <DashboardStatsCard stats={stats} currentOdometer={lastOdometer} />

            {/* Interactive Dynamic Simulator */}
            <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <DynamicBudgetSimulator
                    logs={logs}
                    currentFuelPrice={stats.lastFuelPrice || 40.0}
                />
            </Suspense>

            {/* Weekly/Monthly Summary */}
            <WeeklySummary logs={logs} fuelPurchases={fuelPurchases} />

            {/* Analytics Section */}
            <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                <StationAnalysis fuelPurchases={fuelPurchases} />
            </Suspense>
        </div>
    );
};
