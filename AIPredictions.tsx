import React, { useMemo } from 'react';
import { DailyLog, MaintenanceItem } from './types';
import { Brain, Calendar, TrendingUp, AlertTriangle, Droplets } from 'lucide-react';

interface AIPredictionsProps {
    logs: DailyLog[];
    maintenanceItems: MaintenanceItem[];
    currentOdometer: number;
}

export const AIPredictions: React.FC<AIPredictionsProps> = ({ logs, maintenanceItems, currentOdometer }) => {

    const predictions = useMemo(() => {
        if (logs.length < 2) return null;

        // Sort logs by date
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastLog = sortedLogs[0];
        const firstLog = sortedLogs[sortedLogs.length - 1];

        // 1. Calculate Average Daily KM
        const totalDays = (new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24);
        const totalKm = lastLog.currentOdometer - firstLog.currentOdometer;
        const avgDailyKm = totalDays > 0 ? totalKm / totalDays : 0;

        // 2. Predict Next Refuel Date
        // Assumption: User refuels when tank is near empty. usage pattern matches average.
        // We look at the average days between refuels
        const refuelLogs = sortedLogs.filter(l => l.isRefuelDay);
        let avgDaysBetweenRefuels = 0;
        if (refuelLogs.length > 1) {
            let totalRefuelDays = 0;
            for (let i = 0; i < refuelLogs.length - 1; i++) {
                const diff = (new Date(refuelLogs[i].date).getTime() - new Date(refuelLogs[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
                totalRefuelDays += diff;
            }
            avgDaysBetweenRefuels = totalRefuelDays / (refuelLogs.length - 1);
        }

        const nextRefuelDate = new Date(lastLog.date);
        nextRefuelDate.setDate(nextRefuelDate.getDate() + (avgDaysBetweenRefuels || 7)); // Default 7 if not enough data

        // 3. Predict Next Maintenance Date
        // Find the soonest maintenance item by KM
        let nextMaintenance: { item: MaintenanceItem, date: Date } | null = null;

        maintenanceItems.forEach(item => {
            if (item.type === 'km' && item.nextDueKm) {
                const remainingKm = item.nextDueKm - currentOdometer;
                if (remainingKm > 0 && avgDailyKm > 0) {
                    const daysToMaintenance = remainingKm / avgDailyKm;
                    const date = new Date();
                    date.setDate(date.getDate() + daysToMaintenance);

                    if (!nextMaintenance || date < nextMaintenance.date) {
                        nextMaintenance = { item, date };
                    }
                }
            }
        });

        // 4. Monthly Cost Estimation
        const currentMonth = new Date().getMonth();
        const thisMonthLogs = logs.filter(l => new Date(l.date).getMonth() === currentMonth);
        const thisMonthCost = thisMonthLogs.reduce((sum, l) => sum + l.dailyCost, 0);
        const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
        const currentDay = new Date().getDate();

        // Simple extrapolation
        const estimatedMonthlyCost = currentDay > 0 ? (thisMonthCost / currentDay) * daysInMonth : 0;


        return {
            avgDailyKm,
            nextRefuelDate,
            nextMaintenance,
            estimatedMonthlyCost,
            thisMonthCost
        };
    }, [logs, maintenanceItems, currentOdometer]);

    if (!predictions) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI Asistanı & Tahminler</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Next Refuel */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <Droplets className="w-3 h-3" />
                        Sonraki Yakıt
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {predictions.nextRefuelDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Sürüş alışkanlığına göre tahmini</p>
                </div>

                {/* Maintenance Prediction */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <AlertTriangle className="w-3 h-3" />
                        Sıradaki Bakım
                    </div>
                    {predictions.nextMaintenance ? (
                        <>
                            <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                {predictions.nextMaintenance.item.title}
                            </div>
                            <p className="text-[10px] text-indigo-500 font-medium mt-1">
                                {predictions.nextMaintenance.date.toLocaleDateString('tr-TR')} (Tahmini)
                            </p>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400">Yaklaşan bakım yok</span>
                    )}
                </div>

                {/* Monthly Cost Estimation */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <TrendingUp className="w-3 h-3" />
                        Bu Ay Tahmini
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        ₺{predictions.estimatedMonthlyCost.toFixed(0)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Şu an: ₺{predictions.thisMonthCost.toFixed(0)}
                    </p>
                </div>

                {/* Daily Average */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <Calendar className="w-3 h-3" />
                        Günlük Ortalama
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {predictions.avgDailyKm.toFixed(1)} km
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Son verilerine göre</p>
                </div>
            </div>
        </div>
    );
};
