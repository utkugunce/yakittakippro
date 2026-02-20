import React, { useMemo } from 'react';
import { CalendarClock, AlertTriangle, Droplets } from 'lucide-react';
import { DailyLog, MaintenanceItem } from '../../types';

interface PredictiveForecasterProps {
    logs: DailyLog[];
    maintenanceItems: MaintenanceItem[];
    currentOdometer: number;
}

export const PredictiveForecaster: React.FC<PredictiveForecasterProps> = ({ logs, maintenanceItems, currentOdometer }) => {

    const predictions = useMemo(() => {
        if (logs.length < 3) return null;

        // Sort logs by date ascending
        const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate average daily distance (last 30 days or all if less)
        const recentLogs = sortedLogs.slice(-30);
        const firstLog = recentLogs[0];
        const lastLog = recentLogs[recentLogs.length - 1];

        const daysDiff = Math.max(1, (new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 3600 * 24));
        const distanceDiff = lastLog.currentOdometer - firstLog.currentOdometer;

        const avgDailyDistance = distanceDiff / daysDiff;
        if (avgDailyDistance <= 0) return null;

        // Predict next maintenance
        let nextMaintenance = null;
        let daysToMaintenance = 0;

        const upcomingMaintenance = maintenanceItems
            .filter(item => item.nextDueKm && item.nextDueKm > currentOdometer)
            .sort((a, b) => (a.nextDueKm || 0) - (b.nextDueKm || 0))[0];

        if (upcomingMaintenance && upcomingMaintenance.nextDueKm) {
            const distanceRem = upcomingMaintenance.nextDueKm - currentOdometer;
            daysToMaintenance = Math.ceil(distanceRem / avgDailyDistance);

            const predictedDate = new Date();
            predictedDate.setDate(predictedDate.getDate() + daysToMaintenance);

            nextMaintenance = {
                title: upcomingMaintenance.type,
                predictedDate: predictedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
                daysLeft: daysToMaintenance
            };
        }

        // Predict Empty Tank (assuming 45L tank capacity and using their average consumption)
        const avgConsumption = (recentLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / recentLogs.length) || 7.5;
        const TANK_CAPACITY = 45; // Standard assumption

        // Very basic estimation based on last fuel logged vs current km
        const lastFuelLog = [...recentLogs].reverse().find(l => l.isFullTank);
        let daysToEmpty = null;
        let emptyDateStr = null;

        if (lastFuelLog) {
            const kmSinceFill = currentOdometer - lastFuelLog.currentOdometer;
            const computedUsed = (kmSinceFill / 100) * avgConsumption;
            const remainingFuel = Math.max(0, TANK_CAPACITY - computedUsed);

            const remainingKm = (remainingFuel / avgConsumption) * 100;
            daysToEmpty = Math.ceil(remainingKm / avgDailyDistance);

            const estDate = new Date();
            estDate.setDate(estDate.getDate() + daysToEmpty);
            emptyDateStr = estDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
        }

        return {
            avgDailyDistance: Math.round(avgDailyDistance),
            nextMaintenance,
            emptyTank: daysToEmpty !== null ? {
                daysLeft: daysToEmpty,
                date: emptyDateStr
            } : null
        };

    }, [logs, maintenanceItems, currentOdometer]);

    if (!predictions) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maintenance Predictor */}
            {predictions.nextMaintenance && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/50 flex items-start gap-4">
                    <div className="p-3 bg-white/60 dark:bg-black/20 rounded-xl">
                        <CalendarClock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            Yapay Zeka Bakım Tahmini
                        </h4>
                        <p className="text-sm text-amber-700/80 dark:text-amber-300 mb-2 mt-1">
                            Sürüş alışkanlıklarınıza göre günde ortalama <b>{predictions.avgDailyDistance} km</b> yapıyorsunuz.
                        </p>
                        <div className="flex items-center gap-2 text-amber-800 font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{predictions.nextMaintenance.title}</span>
                            <span className="opacity-50">•</span>
                            <span>{predictions.nextMaintenance.predictedDate}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Fuel Predictor */}
            {predictions.emptyTank && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-800/50 flex items-start gap-4">
                    <div className="p-3 bg-white/60 dark:bg-black/20 rounded-xl">
                        <Droplets className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                            Depo Boşalma Tahmini
                        </h4>
                        <p className="text-sm text-rose-700/80 dark:text-rose-300 mb-2 mt-1">
                            Ortalama tüketiminiz ve son fulleme kaydınıza göre tahmini menzil bitişi.
                        </p>
                        <div className="flex items-center gap-2 py-1 px-3 bg-white/50 dark:bg-black/20 rounded-lg w-fit">
                            <b className="text-rose-800 dark:text-rose-200">Tahmini Tarih:</b>
                            <span className="text-rose-600 font-bold">{predictions.emptyTank.date}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
