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
import { EcoScoreLeaderboard } from './components/EcoScoreLeaderboard';
import { SlidersHorizontal, Check } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';

const OPTIONAL_WIDGETS: { key: string; label: string }[] = [
    { key: 'insights', label: 'Tahmini İçgörüler' },
    { key: 'smartInsights', label: 'Akıllı AI İçgörüleri' },
    { key: 'forecaster', label: 'Yıl Sonu Tahmini' },
    { key: 'simulator', label: 'Bütçe Simülatörü' },
    { key: 'eco', label: 'Eko-Skor Sıralaması' },
    { key: 'weekly', label: 'Haftalık Özet' },
    { key: 'station', label: 'İstasyon Analizi' },
];

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { hidden, toggle } = useDashboardStore();
    const [customizing, setCustomizing] = React.useState(false);
    const isHidden = (key: string) => hidden.includes(key);
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
            {!isHidden('insights') && (
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

            {/* Hero Section Preview */}
            <HeroSection
                logs={filteredLogs}
                fuelPurchases={fuelPurchases}
                vehicle={vehicles.find(v => v.id === selectedVehicleId)}
                onAddFuel={() => openModal('fuel')}
                onAddEntry={() => openModal('entry')}
            />

            {/* Year Filter Tabs + customize */}
            <div className="flex justify-center items-center gap-3">
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
                <button
                    onClick={() => setCustomizing((v) => !v)}
                    aria-label="Panoyu düzenle"
                    aria-pressed={customizing}
                    className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg transition-colors ${customizing ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Customize panel */}
            {customizing && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Pano Bölümleri</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {OPTIONAL_WIDGETS.map(({ key, label }) => {
                            const visible = !isHidden(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggle(key)}
                                    aria-pressed={visible}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${visible ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}
                                >
                                    <span className={`w-4 h-4 rounded flex items-center justify-center border ${visible ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {visible && <Check className="w-3 h-3 text-white" />}
                                    </span>
                                    <span className="truncate">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Smart AI Insights */}
            {!isHidden('smartInsights') && (
                <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <SmartInsightsWidget />
                </Suspense>
            )}

            {/* Predictive Forecaster */}
            {!isHidden('forecaster') && (
                <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <PredictiveForecaster
                        logs={logs}
                        maintenanceItems={maintenanceItems}
                        currentOdometer={lastOdometer}
                    />
                </Suspense>
            )}

            {/* Stats Card (always shown) */}
            <DashboardStatsCard stats={stats} currentOdometer={lastOdometer} />

            {/* Interactive Dynamic Simulator */}
            {!isHidden('simulator') && (
                <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <DynamicBudgetSimulator
                        logs={logs}
                        currentFuelPrice={stats.lastFuelPrice || 40.0}
                    />
                </Suspense>
            )}

            {/* Eco-Score Leaderboard */}
            {!isHidden('eco') && (
                <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <EcoScoreLeaderboard logs={logs} />
                </Suspense>
            )}

            {/* Weekly/Monthly Summary */}
            {!isHidden('weekly') && <WeeklySummary logs={logs} fuelPurchases={fuelPurchases} />}

            {/* Analytics Section */}
            {!isHidden('station') && (
                <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <StationAnalysis fuelPurchases={fuelPurchases} />
                </Suspense>
            )}
        </div>
    );
};
