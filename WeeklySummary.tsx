import React, { useMemo } from 'react';
import { DailyLog } from './types';
import { TrendingUp, TrendingDown, Minus, Calendar, Fuel, Route, Wallet } from 'lucide-react';

interface WeeklySummaryProps {
    logs: DailyLog[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ logs }) => {
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

        const filterByRange = (start: Date, end: Date) => {
            return logs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= start && logDate <= end;
            });
        };

        const thisWeekLogs = filterByRange(thisWeekStart, today);
        const lastWeekLogs = filterByRange(lastWeekStart, lastWeekEnd);
        const thisMonthLogs = filterByRange(thisMonthStart, today);
        const lastMonthLogs = filterByRange(lastMonthStart, lastMonthEnd);

        const calcTotals = (logArr: DailyLog[]) => ({
            distance: logArr.reduce((sum, l) => sum + l.dailyDistance, 0),
            cost: logArr.reduce((sum, l) => sum + l.dailyCost, 0),
            fuel: logArr.reduce((sum, l) => sum + l.dailyFuelConsumed, 0),
            count: logArr.length
        });

        return {
            thisWeek: calcTotals(thisWeekLogs),
            lastWeek: calcTotals(lastWeekLogs),
            thisMonth: calcTotals(thisMonthLogs),
            lastMonth: calcTotals(lastMonthLogs)
        };
    }, [logs]);

    const getChangePercent = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const renderChange = (current: number, previous: number, inverse: boolean = false) => {
        const change = getChangePercent(current, previous);
        const isUp = change > 0;
        const color = inverse ? (isUp ? 'text-red-500' : 'text-green-500') : (isUp ? 'text-green-500' : 'text-red-500');

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

    if (logs.length < 3) return null;

    return (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
            <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Haftalık & Aylık Özet
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* This Week */}
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-2">Bu Hafta</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <Route className="w-3 h-3 mr-1" /> Mesafe
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{summary.thisWeek.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <Wallet className="w-3 h-3 mr-1" /> Harcama
                            </span>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 dark:text-white">₺{summary.thisWeek.cost.toFixed(0)}</span>
                                {renderChange(summary.thisWeek.cost, summary.lastWeek.cost, true)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-2">Bu Ay</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <Route className="w-3 h-3 mr-1" /> Mesafe
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{summary.thisMonth.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <Wallet className="w-3 h-3 mr-1" /> Harcama
                            </span>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 dark:text-white">₺{summary.thisMonth.cost.toFixed(0)}</span>
                                {renderChange(summary.thisMonth.cost, summary.lastMonth.cost, true)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
