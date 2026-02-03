import React, { useMemo, useState } from 'react';
import { DailyLog, FuelPurchase } from '../../../types';
import {
    TrendingUp, TrendingDown, Minus, Calendar, Fuel, Route, Wallet,
    ChevronDown, ChevronUp, Droplets, Activity, Target, BarChart3, ArrowRight
} from 'lucide-react';

interface WeeklySummaryProps {
    logs: DailyLog[];
    fuelPurchases?: FuelPurchase[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ logs, fuelPurchases = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const summary = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // This week (starting Monday)
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() + mondayOffset);

        // Last week
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

        // This month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Last month
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const filterLogsByRange = (start: Date, end: Date) => {
            return logs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= start && logDate <= end;
            });
        };

        const filterPurchasesByRange = (start: Date, end: Date) => {
            return fuelPurchases.filter(p => {
                const pDate = new Date(p.date);
                return pDate >= start && pDate <= end;
            });
        };

        const thisWeekLogs = filterLogsByRange(thisWeekStart, today);
        const lastWeekLogs = filterLogsByRange(lastWeekStart, lastWeekEnd);
        const thisMonthLogs = filterLogsByRange(thisMonthStart, today);
        const lastMonthLogs = filterLogsByRange(lastMonthStart, lastMonthEnd);

        const thisWeekPurchases = filterPurchasesByRange(thisWeekStart, today);
        const lastWeekPurchases = filterPurchasesByRange(lastWeekStart, lastWeekEnd);
        const thisMonthPurchases = filterPurchasesByRange(thisMonthStart, today);
        const lastMonthPurchases = filterPurchasesByRange(lastMonthStart, lastMonthEnd);

        const calcTotals = (logArr: DailyLog[], purchaseArr: FuelPurchase[]) => {
            const logCost = logArr.reduce((sum, l) => sum + l.dailyCost, 0);
            const purchaseCost = purchaseArr.reduce((sum, p) => sum + p.totalAmount, 0);
            const purchaseFuel = purchaseArr.reduce((sum, p) => sum + p.liters, 0);
            const distance = logArr.reduce((sum, l) => sum + l.dailyDistance, 0);

            return {
                distance,
                cost: logCost + purchaseCost, // Include purchases in weekly cost for wallet tracking
                fuel: logArr.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) + purchaseFuel,
                logCount: logArr.length,
                purchaseCount: purchaseArr.length,
                avgConsumption: logArr.length > 0
                    ? logArr.reduce((sum, l) => sum + l.avgConsumption, 0) / logArr.length
                    : 0,
                costPerKm: distance > 0 ? (logCost + purchaseCost) / distance : 0
            };
        };

        // Last 7 Days Trend
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayLogs = filterLogsByRange(d, d);
            const dayPurchases = filterPurchasesByRange(d, d);
            const cost = dayLogs.reduce((s, l) => s + l.dailyCost, 0) + dayPurchases.reduce((s, p) => s + p.totalAmount, 0);

            last7Days.push({
                day: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                cost
            });
        }

        const maxDailyCost = Math.max(...last7Days.map(d => d.cost), 1); // Avoid 0 division

        return {
            thisWeek: calcTotals(thisWeekLogs, thisWeekPurchases),
            lastWeek: calcTotals(lastWeekLogs, lastWeekPurchases),
            thisMonth: calcTotals(thisMonthLogs, thisMonthPurchases),
            lastMonth: calcTotals(lastMonthLogs, lastMonthPurchases),
            trend: last7Days,
            maxDailyCost
        };
    }, [logs, fuelPurchases]);

    const getChangePercent = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const renderChange = (current: number, previous: number, inverse: boolean = false) => {
        const change = getChangePercent(current, previous);
        const isUp = change > 0;
        // inverse: artış kötü (maliyet gibi), azalış iyi
        let color = 'text-gray-400';
        if (Math.abs(change) >= 1) {
            if (inverse) {
                color = isUp ? 'text-red-500' : 'text-emerald-500';
            } else {
                color = isUp ? 'text-emerald-500' : 'text-red-500';
            }
        }

        if (Math.abs(change) < 1) {
            return <Minus className="w-3 h-3 text-gray-400" />;
        }

        return (
            <span className={`flex items-center text-[10px] font-bold ${color} bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded ml-1.5`}>
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {Math.abs(change).toFixed(0)}%
            </span>
        );
    };

    // Calculate averages
    const weeklyAvgPerDay = summary.thisWeek.logCount > 0 || summary.thisWeek.purchaseCount > 0
        ? summary.thisWeek.cost / 7
        : 0;

    const monthlyAvgPerDay = summary.thisMonth.logCount > 0 || summary.thisMonth.purchaseCount > 0
        ? summary.thisMonth.cost / new Date().getDate()
        : 0;

    // Estimate monthly projection
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const monthlyProjection = monthlyAvgPerDay * daysInMonth;

    if (logs.length < 1 && fuelPurchases.length < 1) return null;

    return (
        <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 overflow-hidden backdrop-blur-sm shadow-lg">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">Finansal Özet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Haftalık ve aylık analiz
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="px-3 sm:px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* This Week - Re-designed with chart */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide block mb-1">HAFTALIK HARCAMA</span>
                            <div className="flex items-baseline">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">₺{summary.thisWeek.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                {summary.lastWeek.cost > 0 && renderChange(summary.thisWeek.cost, summary.lastWeek.cost, true)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                <Route className="w-3 h-3 mr-1" />
                                {summary.thisWeek.distance} km
                            </div>
                            <div className="flex items-center justify-end text-xs font-medium text-gray-600 dark:text-gray-300">
                                {summary.thisWeek.costPerKm.toFixed(2)} TL/km
                            </div>
                        </div>
                    </div>

                    {/* Mini Bar Chart */}
                    <div className="flex items-end justify-between h-12 gap-1 mt-2">
                        {summary.trend.map((d, i) => {
                            const heightPercent = summary.maxDailyCost > 0 ? (d.cost / summary.maxDailyCost) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 group relative">
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-sm h-full relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-violet-500 dark:bg-violet-400 transition-all duration-500 rounded-t-sm group-hover:bg-violet-600"
                                            style={{ height: `${Math.max(heightPercent, d.cost > 0 ? 5 : 0)}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-1">{d.day}</span>
                                    {/* Tooltip on hover */}
                                    {d.cost > 0 && (
                                        <div className="hidden group-hover:block absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                                            ₺{d.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide block mb-1">AYLIK HARCAMA</span>
                            <div className="flex items-baseline">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">₺{summary.thisMonth.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                {summary.lastMonth.cost > 0 && renderChange(summary.thisMonth.cost, summary.lastMonth.cost, true)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                <Route className="w-3 h-3 mr-1" />
                                {summary.thisMonth.distance} km
                            </div>
                            <div className="flex items-center justify-end text-xs font-medium text-gray-600 dark:text-gray-300">
                                {summary.thisMonth.costPerKm.toFixed(2)} TL/km
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Projection Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 dark:text-gray-400">Ay Sonu Tahmini</span>
                                <span className="font-bold text-gray-700 dark:text-gray-200">₺{monthlyProjection.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full w-[var(--width)]"
                                    style={{ '--width': `${Math.min((summary.thisMonth.cost / monthlyProjection) * 100, 100)}%` } as any}
                                />
                            </div>
                        </div>

                        {/* Efficiency Stat */}
                        <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-xs text-purple-700 dark:text-purple-300 flex items-center">
                                <Fuel className="w-3 h-3 mr-1.5" />
                                Ort. Tüketim
                            </span>
                            <span className="text-sm font-bold text-purple-800 dark:text-purple-200">
                                {summary.thisMonth.avgConsumption.toFixed(1)} L
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 animate-in slide-in-from-top duration-300 border-t border-gray-100 dark:border-gray-800 pt-4 mt-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Detaylı Karşılaştırma</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Last Week Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Geçen Hafta</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Harcama</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        ₺{summary.lastWeek.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Route className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Mesafe</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {summary.lastWeek.distance.toLocaleString('tr-TR')} km
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Maliyet/Km</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {summary.lastWeek.costPerKm.toFixed(2)} ₺
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="pt-2">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((summary.lastWeek.cost / Math.max(summary.thisWeek.cost, summary.lastWeek.cost)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Last Month Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Geçen Ay</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Harcama</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        ₺{summary.lastMonth.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Route className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Mesafe</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {summary.lastMonth.distance.toLocaleString('tr-TR')} km
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Maliyet/Km</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {summary.lastMonth.costPerKm.toFixed(2)} ₺
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="pt-2">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((summary.lastMonth.cost / Math.max(summary.thisMonth.cost, summary.lastMonth.cost)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Summary */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Haftalık değişim:</span>
                            <span className={`font-bold flex items-center gap-1 ${summary.thisWeek.cost > summary.lastWeek.cost ? 'text-red-500' : 'text-emerald-500'}`}>
                                {summary.thisWeek.cost > summary.lastWeek.cost ? (
                                    <><TrendingUp className="w-3.5 h-3.5" /> +{((summary.thisWeek.cost - summary.lastWeek.cost) / Math.max(summary.lastWeek.cost, 1) * 100).toFixed(0)}%</>
                                ) : (
                                    <><TrendingDown className="w-3.5 h-3.5" /> {((summary.thisWeek.cost - summary.lastWeek.cost) / Math.max(summary.lastWeek.cost, 1) * 100).toFixed(0)}%</>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
