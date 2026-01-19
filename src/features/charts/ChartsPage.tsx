import React, { useState, useMemo } from 'react';
import { Charts } from '../analytics/ChartsPage';
import { BarChart3, Sparkles } from 'lucide-react';
import { QuickStatsBar } from './QuickStatsBar';
import { TimeRangeSelector, TimeRange, filterByTimeRange } from './TimeRangeSelector';
import { ChartAchievements } from './ChartAchievements';
import { ComparisonMode } from './ComparisonMode';
import { InsightBadges } from './InsightBadges';
import { useAppStore } from '../../stores/appStore';

export const ChartsPage: React.FC = () => {
    const { logs, fuelPurchases: purchases, yearFilter } = useAppStore();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    // Filter by year first, then by time range
    const yearFilteredLogs = useMemo(() => {
        if (yearFilter === 'all') return logs;
        return logs.filter(l => new Date(l.date).getFullYear().toString() === yearFilter);
    }, [logs, yearFilter]);

    const yearFilteredPurchases = useMemo(() => {
        if (yearFilter === 'all') return purchases;
        return purchases.filter(p => new Date(p.date).getFullYear().toString() === yearFilter);
    }, [purchases, yearFilter]);

    const filteredLogs = useMemo(() =>
        filterByTimeRange(yearFilteredLogs, timeRange),
        [yearFilteredLogs, timeRange]);

    const filteredPurchases = useMemo(() =>
        filterByTimeRange(yearFilteredPurchases, timeRange),
        [yearFilteredPurchases, timeRange]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Time Range Selector */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    Detaylı Analizler
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </h1>
                                <p className="text-sm text-white/70">
                                    {yearFilter === 'all' ? 'Tüm zamanların' : `${yearFilter} yılı`} verileri
                                </p>
                            </div>
                        </div>
                    </div>

                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                </div>
            </div>

            {/* Quick Stats Bar */}
            <QuickStatsBar logs={filteredLogs} purchases={filteredPurchases} />

            {/* Two Column Layout for Achievements & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartAchievements logs={yearFilteredLogs} purchases={yearFilteredPurchases} />
                <InsightBadges logs={yearFilteredLogs} purchases={yearFilteredPurchases} />
            </div>

            {/* Comparison Mode */}
            <ComparisonMode logs={yearFilteredLogs} />

            {/* Original Charts with enhanced styling */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-primary-500/20 rounded-3xl blur-xl opacity-50" />
                <div className="relative">
                    <Charts
                        logs={filteredLogs}
                        purchases={filteredPurchases}
                    />
                </div>
            </div>
        </div>
    );
};
