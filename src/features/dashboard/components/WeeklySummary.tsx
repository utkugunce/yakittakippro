import React, { useMemo, useState } from 'react';
import { DailyLog, FuelPurchase } from '../../../types';
import {
    TrendingUp, TrendingDown, Minus, Calendar, Fuel, Route, Wallet,
    ChevronDown, ChevronUp, Droplets, Activity, Target, BarChart3
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

            return {
                distance: logArr.reduce((sum, l) => sum + l.dailyDistance, 0),
                cost: logCost, // Sadece günlük kayıtlar
                fuel: logArr.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) + purchaseFuel,
                logCount: logArr.length,
                purchaseCount: purchaseArr.length,
                avgConsumption: logArr.length > 0
                    ? logArr.reduce((sum, l) => sum + l.avgConsumption, 0) / logArr.length
                    : 0
            };
        };

        return {
            thisWeek: calcTotals(thisWeekLogs, thisWeekPurchases),
            lastWeek: calcTotals(lastWeekLogs, lastWeekPurchases),
            thisMonth: calcTotals(thisMonthLogs, thisMonthPurchases),
            lastMonth: calcTotals(lastMonthLogs, lastMonthPurchases)
        };
    }, [logs, fuelPurchases]);

    const getChangePercent = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const renderChange = (current: number, previous: number, inverse: boolean = false) => {
        const change = getChangePercent(current, previous);
        const isUp = change > 0;
        const isDown = change < 0;

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
            <span className={`flex items-center text-xs font-bold ${color}`}>
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {Math.abs(change).toFixed(0)}%
            </span>
        );
    };

    // Calculate averages
    const weeklyAvgPerDay = summary.thisWeek.logCount > 0
        ? summary.thisWeek.cost / 7
        : 0;

    const monthlyAvgPerDay = summary.thisMonth.logCount > 0
        ? summary.thisMonth.cost / new Date().getDate()
        : 0;

    // Estimate monthly projection
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const monthlyProjection = monthlyAvgPerDay * daysInMonth;

    if (logs.length < 1 && fuelPurchases.length < 1) return null;

    return (
        <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 overflow-hidden backdrop-blur-sm shadow-lg">
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 dark:hover:bg-black/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">Haftalık & Aylık Özet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {summary.thisWeek.logCount + summary.thisWeek.purchaseCount} kayıt bu hafta
                        </p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-black/20 transition-colors">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                </button>
            </div>

            {/* Summary Cards - Always Visible */}
            <div className="px-3 sm:px-4 pb-4 grid grid-cols-2 gap-2 sm:gap-3">
                {/* This Week Card */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 min-w-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-[10px] sm:text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Bu Hafta</span>
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-violet-500 flex-shrink-0" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Route className="w-3 h-3 mr-1 text-blue-500" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                {summary.thisWeek.distance.toLocaleString('tr-TR')} km
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Wallet className="w-3 h-3 mr-1 text-emerald-500" />
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                    ₺{summary.thisWeek.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                </span>
                                {renderChange(summary.thisWeek.cost, summary.lastWeek.cost, true)}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Droplets className="w-3 h-3 mr-1 text-cyan-500" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                {summary.thisWeek.fuel.toFixed(1)} L
                            </span>
                        </div>
                    </div>
                </div>

                {/* This Month Card */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 min-w-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Bu Ay</span>
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Route className="w-3 h-3 mr-1 text-blue-500" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                {summary.thisMonth.distance.toLocaleString('tr-TR')} km
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Wallet className="w-3 h-3 mr-1 text-emerald-500" />
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                    ₺{summary.thisMonth.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                </span>
                                {renderChange(summary.thisMonth.cost, summary.lastMonth.cost, true)}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0">
                                <Droplets className="w-3 h-3 mr-1 text-cyan-500" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                                {summary.thisMonth.fuel.toFixed(1)} L
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 space-y-3 sm:space-y-4 animate-in slide-in-from-top duration-300">
                    {/* Comparison Stats */}
                    <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-violet-500" />
                            Detaylı Karşılaştırma
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            {/* Weekly Comparison */}
                            <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Haftalık</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs gap-1">
                                        <span className="text-gray-600 dark:text-gray-400 truncate">Geçen:</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            ₺{summary.lastWeek.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs gap-1">
                                        <span className="text-gray-600 dark:text-gray-400 truncate">Bu:</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            ₺{summary.thisWeek.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs pt-1 border-t border-gray-200 dark:border-gray-700 gap-1">
                                        <span className="text-gray-600 dark:text-gray-400">Fark:</span>
                                        <span className={`font-bold truncate ${summary.thisWeek.cost > summary.lastWeek.cost ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {summary.thisWeek.cost > summary.lastWeek.cost ? '+' : ''}
                                            ₺{(summary.thisWeek.cost - summary.lastWeek.cost).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Comparison */}
                            <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Aylık</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs gap-1">
                                        <span className="text-gray-600 dark:text-gray-400 truncate">Geçen:</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            ₺{summary.lastMonth.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs gap-1">
                                        <span className="text-gray-600 dark:text-gray-400 truncate">Bu:</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            ₺{summary.thisMonth.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-xs pt-1 border-t border-gray-200 dark:border-gray-700 gap-1">
                                        <span className="text-gray-600 dark:text-gray-400">Fark:</span>
                                        <span className={`font-bold truncate ${summary.thisMonth.cost > summary.lastMonth.cost ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {summary.thisMonth.cost > summary.lastMonth.cost ? '+' : ''}
                                            ₺{(summary.thisMonth.cost - summary.lastMonth.cost).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projections */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 sm:p-4 border border-amber-200/50 dark:border-amber-700/50">
                        <h4 className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 sm:mb-3 flex items-center">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Ay Sonu Tahmini
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Günlük Ort.</p>
                                <p className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white truncate">
                                    ₺{monthlyAvgPerDay.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Ay Sonu</p>
                                <p className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400 truncate">
                                    ₺{monthlyProjection.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                        {summary.lastMonth.cost > 0 && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-amber-200/50 dark:border-amber-700/50">
                                <div className="flex items-center justify-between text-[10px] sm:text-xs gap-1">
                                    <span className="text-gray-600 dark:text-gray-400 truncate">Geçen aya göre:</span>
                                    <span className={`font-bold ${monthlyProjection > summary.lastMonth.cost ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {monthlyProjection > summary.lastMonth.cost ? '+' : ''}
                                        {((monthlyProjection - summary.lastMonth.cost) / summary.lastMonth.cost * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fuel Efficiency */}
                    {(summary.thisWeek.avgConsumption > 0 || summary.thisMonth.avgConsumption > 0) && (
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-700/50">
                            <h4 className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 mb-3 flex items-center">
                                <Fuel className="w-4 h-4 mr-2" />
                                Yakıt Verimliliği
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Haftalık Ort. Tüketim</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {summary.thisWeek.avgConsumption.toFixed(1)} L/100km
                                        </p>
                                        {summary.lastWeek.avgConsumption > 0 && renderChange(summary.thisWeek.avgConsumption, summary.lastWeek.avgConsumption, true)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aylık Ort. Tüketim</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {summary.thisMonth.avgConsumption.toFixed(1)} L/100km
                                        </p>
                                        {summary.lastMonth.avgConsumption > 0 && renderChange(summary.thisMonth.avgConsumption, summary.lastMonth.avgConsumption, true)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
