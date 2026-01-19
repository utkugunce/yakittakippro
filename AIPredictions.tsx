import React, { useMemo } from 'react';
import { DailyLog, MaintenanceItem, VehiclePart, FuelPurchase } from './types';
import { Droplets, TrendingUp, TrendingDown, Gauge, Calendar, Wallet, BarChart3 } from 'lucide-react';

interface AIPredictionsProps {
    logs: DailyLog[];
    purchases?: FuelPurchase[];
    maintenanceItems: MaintenanceItem[];
    vehicleParts: VehiclePart[];
    currentOdometer: number;
}

export const AIPredictions: React.FC<AIPredictionsProps> = ({ logs, purchases = [], maintenanceItems, vehicleParts, currentOdometer }) => {
    const predictions = useMemo(() => {
        if (logs.length < 2 && purchases.length < 2) return null;

        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // --- Ortalama Tüketim Hesaplama ---
        const consumptionValues = logs.filter(l => l.avgConsumption > 0).map(l => l.avgConsumption);
        const avgConsumption = consumptionValues.length > 0 
            ? consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length 
            : 0;

        // --- Günlük Ortalama KM ---
        let avgDailyKm = 0;
        if (sortedLogs.length >= 2) {
            const lastLog = sortedLogs[0];
            const firstLog = sortedLogs[sortedLogs.length - 1];
            const totalDays = (new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24);
            const totalKm = lastLog.currentOdometer - firstLog.currentOdometer;
            avgDailyKm = totalDays > 0 ? totalKm / totalDays : 0;
        }

        // --- Tahmini Sonraki Yakıt Alımı ---
        // Yakıt alımları arasındaki ortalama gün sayısı
        let avgDaysBetweenRefuels = 7;
        let estimatedRefuelDate = new Date();
        
        if (sortedPurchases.length >= 2) {
            let totalRefuelDays = 0;
            for (let i = 0; i < sortedPurchases.length - 1; i++) {
                totalRefuelDays += (new Date(sortedPurchases[i].date).getTime() - new Date(sortedPurchases[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
            }
            avgDaysBetweenRefuels = Math.round(totalRefuelDays / (sortedPurchases.length - 1));
            
            const lastPurchaseDate = new Date(sortedPurchases[0].date);
            estimatedRefuelDate = new Date(lastPurchaseDate);
            estimatedRefuelDate.setDate(estimatedRefuelDate.getDate() + avgDaysBetweenRefuels);
        } else if (sortedLogs.length > 0) {
            const refuelLogs = sortedLogs.filter(l => l.isRefuelDay);
            if (refuelLogs.length > 1) {
                let totalRefuelDays = 0;
                for (let i = 0; i < refuelLogs.length - 1; i++) {
                    totalRefuelDays += (new Date(refuelLogs[i].date).getTime() - new Date(refuelLogs[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
                }
                avgDaysBetweenRefuels = Math.round(totalRefuelDays / (refuelLogs.length - 1));
            }
            estimatedRefuelDate = new Date(sortedLogs[0].date);
            estimatedRefuelDate.setDate(estimatedRefuelDate.getDate() + avgDaysBetweenRefuels);
        }
        
        // Eğer tahmin geçmişte kaldıysa bugünden itibaren hesapla
        if (estimatedRefuelDate < new Date()) {
            const daysPassed = Math.floor((new Date().getTime() - estimatedRefuelDate.getTime()) / (1000 * 60 * 60 * 24));
            const cyclesPassed = Math.ceil(daysPassed / avgDaysBetweenRefuels);
            estimatedRefuelDate.setDate(estimatedRefuelDate.getDate() + (cyclesPassed * avgDaysBetweenRefuels));
        }

        // --- Tahmini Aylık Harcama ---
        // Son 30 günlük harcamayı baz al
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysPurchases = purchases.filter(p => new Date(p.date) >= thirtyDaysAgo);
        const last30DaysCost = last30DaysPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        
        // Eğer son 30 günde yeterli veri yoksa, tüm verilerin ortalamasını al
        let estimatedMonthlyCost = last30DaysCost;
        if (last30DaysPurchases.length < 2 && purchases.length >= 2) {
            const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
            const firstPurchase = sortedPurchases[sortedPurchases.length - 1];
            const lastPurchase = sortedPurchases[0];
            const totalDays = (new Date(lastPurchase.date).getTime() - new Date(firstPurchase.date).getTime()) / (1000 * 60 * 60 * 24);
            if (totalDays > 0) {
                estimatedMonthlyCost = (totalPurchaseCost / totalDays) * 30;
            }
        }

        // --- Haftalık Trend (Maliyet Bazlı) ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const thisWeekPurchases = purchases.filter(p => new Date(p.date) >= sevenDaysAgo);
        const lastWeekPurchases = purchases.filter(p => new Date(p.date) >= fourteenDaysAgo && new Date(p.date) < sevenDaysAgo);
        
        const thisWeekCost = thisWeekPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const lastWeekCost = lastWeekPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        
        const weeklyChange = lastWeekCost > 0 ? ((thisWeekCost - lastWeekCost) / lastWeekCost) * 100 : 0;

        // --- Aylık Trend ---
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const thisMonthPurchases = purchases.filter(p => new Date(p.date) >= thirtyDaysAgo);
        const lastMonthPurchases = purchases.filter(p => new Date(p.date) >= sixtyDaysAgo && new Date(p.date) < thirtyDaysAgo);
        
        const thisMonthCost = thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const lastMonthCost = lastMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        
        const monthlyChange = lastMonthCost > 0 ? ((thisMonthCost - lastMonthCost) / lastMonthCost) * 100 : 0;

        // --- Kalan Gün Hesabı ---
        const daysUntilRefuel = Math.max(0, Math.ceil((estimatedRefuelDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

        return {
            avgConsumption,
            avgDailyKm,
            estimatedRefuelDate,
            daysUntilRefuel,
            avgDaysBetweenRefuels,
            estimatedMonthlyCost,
            weeklyChange,
            monthlyChange,
            thisWeekCost,
            thisMonthCost
        };
    }, [logs, purchases]);

    if (!predictions) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tahminler için en az 2 kayıt gerekli</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tahminler & Trendler</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tüketim verilerinize göre</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Tahmini Sonraki Yakıt */}
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sonraki Yakıt</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {predictions.estimatedRefuelDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ~{predictions.daysUntilRefuel} gün sonra
                    </div>
                </div>

                {/* Tahmini Aylık Harcama */}
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tahmini Aylık</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                        ₺{predictions.estimatedMonthlyCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ~{predictions.avgDaysBetweenRefuels} günde 1 alım
                    </div>
                </div>

                {/* Ortalama Tüketim */}
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ort. Tüketim</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {predictions.avgConsumption.toFixed(1)} <span className="text-sm font-normal">L/100km</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ~{predictions.avgDailyKm.toFixed(0)} km/gün
                    </div>
                </div>

                {/* Haftalık Trend */}
                <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                    predictions.weeklyChange > 5 
                        ? 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                        : predictions.weeklyChange < -5
                        ? 'bg-green-50/70 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                        : 'bg-white/70 dark:bg-gray-800/70 border-white/50 dark:border-gray-700'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {predictions.weeklyChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Haftalık Trend</span>
                    </div>
                    <div className={`text-lg font-bold ${
                        predictions.weeklyChange > 5 ? 'text-red-600 dark:text-red-400' 
                        : predictions.weeklyChange < -5 ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                        {predictions.weeklyChange > 0 ? '+' : ''}{predictions.weeklyChange.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Bu hafta: ₺{predictions.thisWeekCost.toFixed(0)}
                    </div>
                </div>

                {/* Aylık Trend */}
                <div className={`p-4 rounded-xl border backdrop-blur-sm col-span-2 lg:col-span-2 ${
                    predictions.monthlyChange > 10 
                        ? 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                        : predictions.monthlyChange < -10
                        ? 'bg-green-50/70 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                        : 'bg-white/70 dark:bg-gray-800/70 border-white/50 dark:border-gray-700'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Aylık Trend</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div className={`text-lg font-bold ${
                            predictions.monthlyChange > 10 ? 'text-red-600 dark:text-red-400' 
                            : predictions.monthlyChange < -10 ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-800 dark:text-white'
                        }`}>
                            {predictions.monthlyChange > 0 ? '+' : ''}{predictions.monthlyChange.toFixed(0)}%
                            <span className="text-sm font-normal ml-1">
                                {predictions.monthlyChange > 10 ? '📈' : predictions.monthlyChange < -10 ? '📉' : '➡️'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Bu ay: <span className="font-semibold">₺{predictions.thisMonthCost.toFixed(0)}</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Geçen aya kıyasla {predictions.monthlyChange > 0 ? 'artış' : predictions.monthlyChange < 0 ? 'düşüş' : 'değişim yok'}
                    </div>
                </div>
            </div>
        </div>
    );
};
