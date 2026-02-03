import { useMemo } from 'react';
import { DailyLog, FuelPurchase } from '../../../types';

interface ChartData {
    name: string;
    maliyet: number;
    tuketim: number;
    ortalamaTuketim: number;
    haftalikOrtalama: number;
    benzinFiyati: number;
    kmMaliyeti: number;
}

interface MonthlyData {
    name: string;
    maliyet: number;
    mesafe: number;
    yakit: number;
    ortTuketim: number;
}

interface StationData {
    name: string;
    value: number;
}

export interface UseChartDataResult {
    dailyData: ChartData[];
    monthlyData: MonthlyData[];
    stationData: StationData[];
    hasEnoughData: boolean;
}

export function useChartData(logs: DailyLog[], purchases: FuelPurchase[]): UseChartDataResult {
    const sortedLogs = useMemo(() =>
        [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [logs]
    );

    const dailyData = useMemo(() => {
        return sortedLogs.map((log, index, array) => {
            const startIdx = Math.max(0, index - 6);
            const subset = array.slice(startIdx, index + 1);
            const sum = subset.reduce((acc, curr) => acc + curr.avgConsumption, 0);
            const movingAvg = sum / subset.length;

            return {
                name: new Date(log.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                maliyet: log.dailyCost,
                tuketim: log.dailyFuelConsumed,
                ortalamaTuketim: log.avgConsumption,
                haftalikOrtalama: movingAvg,
                benzinFiyati: log.fuelPrice,
                kmMaliyeti: log.costPerKm
            };
        }).slice(-15);
    }, [sortedLogs]);

    const monthlyData = useMemo(() => {
        const monthlyGroups: Record<string, {
            month: string;
            monthLabel: string;
            totalCost: number;
            totalDistance: number;
            totalFuel: number;
            avgConsumption: number;
            count: number
        }> = {};

        logs.forEach(log => {
            const date = new Date(log.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });

            if (!monthlyGroups[key]) {
                monthlyGroups[key] = { month: key, monthLabel, totalCost: 0, totalDistance: 0, totalFuel: 0, avgConsumption: 0, count: 0 };
            }
            monthlyGroups[key].totalCost += log.dailyCost;
            monthlyGroups[key].totalDistance += log.dailyDistance;
            monthlyGroups[key].totalFuel += log.dailyFuelConsumed;
            monthlyGroups[key].avgConsumption += log.avgConsumption;
            monthlyGroups[key].count += 1;
        });

        return Object.values(monthlyGroups)
            .map(m => ({
                name: m.monthLabel,
                maliyet: Math.round(m.totalCost),
                mesafe: Math.round(m.totalDistance),
                yakit: Math.round(m.totalFuel * 10) / 10,
                ortTuketim: m.count > 0 ? Math.round((m.avgConsumption / m.count) * 10) / 10 : 0
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(-6);
    }, [logs]);

    const stationData = useMemo(() => {
        const stats: Record<string, number> = {};

        logs.forEach(log => {
            if (log.fuelStation) {
                stats[log.fuelStation] = (stats[log.fuelStation] || 0) + 1;
            }
        });

        purchases.forEach(p => {
            if (p.station) {
                stats[p.station] = (stats[p.station] || 0) + 1;
            }
        });

        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [logs, purchases]);

    const hasEnoughData = logs.length >= 2 || purchases.length >= 2;

    return {
        dailyData,
        monthlyData,
        stationData,
        hasEnoughData
    };
}
