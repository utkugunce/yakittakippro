import { useMemo } from 'react';
import { DailyLog, FuelPurchase, DashboardStats } from '../types';

interface UseDashboardStatsProps {
    logs: DailyLog[];
    fuelPurchases: FuelPurchase[];
    yearFilter: string;
}

export const useDashboardStats = ({ logs, fuelPurchases, yearFilter }: UseDashboardStatsProps): DashboardStats => {
    return useMemo(() => {
        const yearFilteredLogs = yearFilter === 'all'
            ? logs
            : logs.filter(l => new Date(l.date).getFullYear().toString() === yearFilter);

        const yearFilteredPurchases = yearFilter === 'all'
            ? fuelPurchases
            : fuelPurchases.filter(p => new Date(p.date).getFullYear().toString() === yearFilter);

        if (yearFilteredLogs.length === 0 && yearFilteredPurchases.length === 0) {
            return { totalDistance: 0, totalCost: 0, avgCostPerKm: 0, avgConsumption: 0, lastFuelPrice: 0, totalLiters: 0, weightedAvgPrice: 0 };
        }

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
};
