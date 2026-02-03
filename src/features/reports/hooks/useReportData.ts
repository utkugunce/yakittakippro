import { useState, useMemo } from 'react';
import { DailyLog, FuelPurchase } from '../../../types';

export type DateRangePreset = 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'all';

export interface StatSummary {
    min: number;
    max: number;
    avg: number;
    minDate: string;
    maxDate: string;
}

// Native Date Helpers to replace date-fns
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);
const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
const subMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
};
const isWithinInterval = (date: Date, interval: { start: Date; end: Date }) => {
    return date >= interval.start && date <= interval.end;
};

export const useReportData = (logs: DailyLog[], purchases: FuelPurchase[]) => {
    const [dateRange, setDateRange] = useState<DateRangePreset>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // helper to get range dates
    const rangeDates = useMemo(() => {
        const now = new Date();
        switch (dateRange) {
            case 'thisMonth':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            case 'last3Months':
                return { start: subMonths(now, 3), end: now };
            case 'thisYear':
                return { start: startOfYear(now), end: endOfYear(now) };
            default:
                return undefined;
        }
    }, [dateRange]);

    // Filter Logs
    const filteredLogs = useMemo(() => {
        if (!rangeDates) return logs;
        const { start, end } = rangeDates;
        return logs.filter(log => {
            const logDate = new Date(log.date);
            return isWithinInterval(logDate, { start, end });
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs, rangeDates]);

    // Filter Purchases
    const filteredPurchases = useMemo(() => {
        if (!rangeDates) return purchases;
        const { start, end } = rangeDates;
        return purchases.filter(p => {
            const pDate = new Date(p.date);
            return isWithinInterval(pDate, { start, end });
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [purchases, rangeDates]);

    // Calculate General Stats
    const stats = useMemo(() => {
        const totalDistance = filteredLogs.reduce((acc, log) => acc + log.dailyDistance, 0);
        const totalCostLogs = filteredLogs.reduce((acc, log) => acc + log.dailyCost, 0);
        const totalFuelLogs = filteredLogs.reduce((acc, log) => acc + log.dailyFuelConsumed, 0);

        const totalCostPurchases = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
        const totalFuelPurchases = filteredPurchases.reduce((acc, p) => acc + p.liters, 0);

        const totalCost = totalCostLogs + totalCostPurchases;
        const totalFuel = totalFuelLogs + totalFuelPurchases;

        const logCount = filteredLogs.length;
        const purchaseCount = filteredPurchases.length;

        // Averages
        const avgConsumption = totalDistance > 0 ? (totalFuelLogs / totalDistance) * 100 : 0;
        const avgCostPerKm = totalDistance > 0 ? totalCostLogs / totalDistance : 0;

        return {
            totalDistance,
            totalCost,
            totalFuel,
            logCount,
            purchaseCount,
            avgConsumption,
            avgCostPerKm,
            totalCostPurchases,
            totalFuelPurchases,
            totalCostLogs
        };
    }, [filteredLogs, filteredPurchases]);

    // Helper for Min/Max/Avg Stats
    const calcStat = (arr: DailyLog[], getter: (l: DailyLog) => number): StatSummary => {
        if (arr.length === 0) return { min: 0, max: 0, avg: 0, minDate: '', maxDate: '' };
        const values = arr.map(getter);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
        const minLog = arr.find(l => getter(l) === minVal);
        const maxLog = arr.find(l => getter(l) === maxVal);
        return {
            min: minVal,
            max: maxVal,
            avg: avgVal,
            minDate: minLog?.date || '',
            maxDate: maxLog?.date || ''
        };
    };

    // Advanced Stats & Breakdowns
    const advancedStats = useMemo(() => {
        if (logs.length === 0) return null;

        // Best/Worst Consumption
        const validLogs = logs.filter(l => l.avgConsumption > 0);
        const bestLog = validLogs.length > 0 ? validLogs.reduce((prev, curr) => prev.avgConsumption < curr.avgConsumption ? prev : curr) : null;
        const worstLog = validLogs.length > 0 ? validLogs.reduce((prev, curr) => prev.avgConsumption > curr.avgConsumption ? prev : curr) : null;

        // Detailed Stats
        const dailyDistance = calcStat(logs, l => l.dailyDistance);
        const avgConsumptionStat = calcStat(validLogs, l => l.avgConsumption);
        const dailyFuel = calcStat(logs, l => l.dailyFuelConsumed);
        const fuelPrice = calcStat(logs.filter(l => l.fuelPrice > 0), l => l.fuelPrice);
        const dailyCost = calcStat(logs, l => l.dailyCost);
        const costPerKm = calcStat(logs.filter(l => l.costPerKm > 0), l => l.costPerKm);

        // Monthly Breakdown
        const monthlyGroups = logs.reduce((acc, log) => {
            const date = new Date(log.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[key]) {
                acc[key] = {
                    month: key,
                    totalDistance: 0,
                    totalCost: 0,
                    totalFuel: 0,
                    logCount: 0
                };
            }
            acc[key].totalDistance += log.dailyDistance;
            acc[key].totalCost += log.dailyCost;
            acc[key].totalFuel += log.dailyFuelConsumed;
            acc[key].logCount += 1;
            return acc;
        }, {} as Record<string, { month: string, totalDistance: number, totalCost: number, totalFuel: number, logCount: number }>);

        // Usage from purchases
        purchases.forEach(p => {
            const date = new Date(p.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyGroups[key]) {
                monthlyGroups[key] = {
                    month: key,
                    totalDistance: 0,
                    totalCost: 0,
                    totalFuel: 0,
                    logCount: 0
                };
            }
            monthlyGroups[key].totalCost += p.totalAmount;
            monthlyGroups[key].totalFuel += p.liters;
        });

        const monthlyData = Object.values(monthlyGroups).sort((a, b) => b.month.localeCompare(a.month));

        // Comparisons
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = now;
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = new Date(subMonths(now, 1).getFullYear(), subMonths(now, 1).getMonth(), Math.min(now.getDate(), endOfMonth(subMonths(now, 1)).getDate()));

        const getInPeriod = (arr: any[], start: Date, end: Date) => arr.filter(i => {
            const d = new Date(i.date);
            return d >= start && d <= end;
        });

        const thisLogs = getInPeriod(logs, thisMonthStart, thisMonthEnd);
        const lastLogs = getInPeriod(logs, lastMonthStart, lastMonthEnd);
        const thisPurchases = getInPeriod(purchases, thisMonthStart, thisMonthEnd);
        const lastPurchases = getInPeriod(purchases, lastMonthStart, lastMonthEnd);

        const sumStats = (lArr: DailyLog[], pArr: FuelPurchase[]) => ({
            totalCost: lArr.reduce((s, l) => s + l.dailyCost, 0) + pArr.reduce((s, p) => s + p.totalAmount, 0),
            totalDistance: lArr.reduce((s, l) => s + l.dailyDistance, 0),
            totalFuel: lArr.reduce((s, l) => s + l.dailyFuelConsumed, 0) + pArr.reduce((s, p) => s + p.liters, 0),
        });

        const thisMonthData = sumStats(thisLogs, thisPurchases);
        const lastMonthData = sumStats(lastLogs, lastPurchases);

        const costChange = lastMonthData.totalCost > 0 ? ((thisMonthData.totalCost - lastMonthData.totalCost) / lastMonthData.totalCost) * 100 : 0;
        const distanceChange = lastMonthData.totalDistance > 0 ? ((thisMonthData.totalDistance - lastMonthData.totalDistance) / lastMonthData.totalDistance) * 100 : 0;
        const fuelChange = lastMonthData.totalFuel > 0 ? ((thisMonthData.totalFuel - lastMonthData.totalFuel) / lastMonthData.totalFuel) * 100 : 0;

        return {
            bestLog,
            worstLog,
            dailyDistance,
            avgConsumptionStat,
            dailyFuel,
            fuelPrice,
            dailyCost,
            costPerKm,
            monthlyData,
            comparison: {
                thisMonth: thisMonthData,
                lastMonth: lastMonthData,
                costChange,
                distanceChange,
                fuelChange
            }
        };
    }, [logs, purchases]);

    return {
        dateRange,
        setDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        filteredLogs,
        filteredPurchases,
        stats,
        advancedStats,
        rangeLabel: rangeDates ? rangeDates.start.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : 'Tüm Zamanlar'
    };
};
