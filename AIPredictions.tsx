import React, { useMemo } from 'react';
import { DailyLog, MaintenanceItem, VehiclePart } from './types';
import { Brain, Calendar, TrendingUp, AlertTriangle, Droplets } from 'lucide-react';

interface AIPredictionsProps {
    logs: DailyLog[];
    maintenanceItems: MaintenanceItem[];
    vehicleParts: VehiclePart[];
    currentOdometer: number;
}

export const AIPredictions: React.FC<AIPredictionsProps> = ({ logs, maintenanceItems, vehicleParts, currentOdometer }) => {

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
        nextRefuelDate.setDate(nextRefuelDate.getDate() + (avgDaysBetweenRefuels || 7));

        // 3. Predict Next Service (Maintenance or Part Change)
        let nextService: { title: string, date: Date, type: 'maintenance' | 'part' } | null = null;

        // Check Maintenance Items
        maintenanceItems.forEach(item => {
            // KM-based maintenance
            if ((item.type === 'km' || item.type === 'both') && item.nextDueKm) {
                const remainingKm = item.nextDueKm - currentOdometer;
                if (remainingKm > 0 && avgDailyKm > 0) {
                    const daysToMaintenance = remainingKm / avgDailyKm;
                    const date = new Date();
                    date.setDate(date.getDate() + daysToMaintenance);

                    if (!nextService || date < nextService.date) {
                        nextService = { title: item.title, date, type: 'maintenance' };
                    }
                }
            }

            // Date-based maintenance (kasko, sigorta, muayene)
            if ((item.type === 'date' || item.type === 'both') && item.dueDate) {
                const dueDate = new Date(item.dueDate);
                const now = new Date();

                // Only show if due date is in the future
                if (dueDate > now) {
                    if (!nextService || dueDate < nextService.date) {
                        nextService = { title: item.title, date: dueDate, type: 'maintenance' };
                    }
                }
            }
        });

        // Check Parts
        (vehicleParts || []).forEach(part => {
            if (part.isActive && part.lifespanKm) {
                const remaining = (part.installKm + part.lifespanKm) - currentOdometer;
                if (remaining > 0 && avgDailyKm > 0) {
                    const days = remaining / avgDailyKm;
                    const date = new Date();
                    date.setDate(date.getDate() + days);

                    if (!nextService || date < nextService.date) {
                        nextService = { title: `${part.name} Değişimi`, date, type: 'part' };
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

        // 5. ANOMALY DETECTION - using standard deviation
        const consumptionValues = logs.filter(l => l.avgConsumption > 0).map(l => l.avgConsumption);
        const avgConsumption = consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
        const variance = consumptionValues.reduce((sum, val) => sum + Math.pow(val - avgConsumption, 2), 0) / consumptionValues.length;
        const stdDev = Math.sqrt(variance);

        // Check last 7 days for anomalies
        const last7Days = sortedLogs.slice(0, 7);
        const last7Consumption = last7Days.filter(l => l.avgConsumption > 0).map(l => l.avgConsumption);
        const last7Avg = last7Consumption.length > 0 ? last7Consumption.reduce((a, b) => a + b, 0) / last7Consumption.length : 0;

        let anomaly: { type: 'high' | 'low' | null, percentage: number, message: string } = { type: null, percentage: 0, message: '' };

        if (last7Avg > avgConsumption + stdDev * 1.5) {
            const percentIncrease = ((last7Avg - avgConsumption) / avgConsumption) * 100;
            anomaly = {
                type: 'high',
                percentage: percentIncrease,
                message: `Son 7 günde tüketim normalden %${percentIncrease.toFixed(0)} fazla!`
            };
        } else if (last7Avg < avgConsumption - stdDev * 1.5 && last7Avg > 0) {
            const percentDecrease = ((avgConsumption - last7Avg) / avgConsumption) * 100;
            anomaly = {
                type: 'low',
                percentage: percentDecrease,
                message: `Tebrikler! Son 7 günde %${percentDecrease.toFixed(0)} tasarruf ettiniz.`
            };
        }

        // 6. FUEL SAVING TIPS based on data
        const savingsTips: string[] = [];

        if (avgConsumption > 8) {
            savingsTips.push("🚗 Lastik basınçlarını kontrol edin - düşük basınç tüketimi artırır");
        }
        if (avgDailyKm > 100) {
            savingsTips.push("🛣️ Uzun yolda sabit hız kullanın - cruise control tasarruf sağlar");
        }
        if (logs.some(l => l.avgConsumption > avgConsumption * 1.3)) {
            savingsTips.push("⚡ Ani hızlanma ve frenlerden kaçının");
        }
        const priceVariance = logs.filter(l => l.fuelPrice > 0).map(l => l.fuelPrice);
        if (priceVariance.length > 2) {
            const maxPrice = Math.max(...priceVariance);
            const minPrice = Math.min(...priceVariance);
            if ((maxPrice - minPrice) / minPrice > 0.1) {
                savingsTips.push("⛽ Fiyat farkı yüksek - en ucuz istasyonu tercih edin");
            }
        }

        // Weekly change calculation
        const prev7Days = sortedLogs.slice(7, 14);
        const prev7Cost = prev7Days.reduce((sum, l) => sum + l.dailyCost, 0);
        const last7Cost = sortedLogs.slice(0, 7).reduce((sum, l) => sum + l.dailyCost, 0);
        const weeklyChange = prev7Cost > 0 ? ((last7Cost - prev7Cost) / prev7Cost) * 100 : 0;

        // 7. Manufacturer/Brand Analysis for Tips
        const brandStats: Record<string, { totalAmount: number, totalLiters: number }> = {};
        logs.forEach(l => {
            if (l.fuelStation && l.dailyFuelConsumed > 0) {
                if (!brandStats[l.fuelStation]) brandStats[l.fuelStation] = { totalAmount: 0, totalLiters: 0 };
                brandStats[l.fuelStation].totalAmount += l.dailyCost;
                brandStats[l.fuelStation].totalLiters += l.dailyFuelConsumed;
            }
        });

        // Calculate avg price per brand
        const brands = Object.keys(brandStats).map(b => {
            const stats = brandStats[b];
            return { name: b, avgPrice: stats.totalLiters > 0 ? stats.totalAmount / stats.totalLiters : 0 };
        }).filter(b => b.avgPrice > 0);

        if (brands.length > 1) {
            brands.sort((a, b) => a.avgPrice - b.avgPrice);
            const cheapest = brands[0];
            const mostExpensive = brands[brands.length - 1];

            if (mostExpensive.avgPrice > cheapest.avgPrice * 1.05) { // 5% difference
                const diff = mostExpensive.avgPrice - cheapest.avgPrice;
                savingsTips.push(`🏷️ ${cheapest.name} istasyonları ${mostExpensive.name}'e göre ortalama ₺${diff.toFixed(2)}/L daha ucuz!`);
            }
        }

        // 8. Best Day to Buy Fuel (Frequency Analysis + Price)
        // Find which day of week has lowest average price historically
        const dayStats: Record<number, { total: number, count: number }> = {};
        logs.filter(l => l.fuelPrice > 0).forEach(l => {
            const day = new Date(l.date).getDay();
            if (!dayStats[day]) dayStats[day] = { total: 0, count: 0 };
            dayStats[day].total += l.fuelPrice;
            dayStats[day].count += 1;
        });

        let bestDay = -1;
        let minAvgPrice = Infinity;

        Object.keys(dayStats).forEach(dayKey => {
            const d = parseInt(dayKey);
            const avg = dayStats[d].total / dayStats[d].count;
            if (avg < minAvgPrice) {
                minAvgPrice = avg;
                bestDay = d;
            }
        });

        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        if (bestDay !== -1 && minAvgPrice < Infinity) {
            savingsTips.push(`📅 Geçmiş verilerinize göre en uygun yakıt fiyatları ${dayNames[bestDay]} günleri denk geliyor.`);
        }

        // 9. Seasonal Tips
        const month = new Date().getMonth(); // 0-11
        if (month >= 10 || month <= 2) { // Nov-Mar
            savingsTips.push("❄️ Kış lastikleri yakıt tüketimini etkileyebilir. Basınçları düzenli kontrol edin.");
            if (avgConsumption > 9) savingsTips.push("🌡️ Motor ısınmadan yüksek devire çıkmak kışın tüketimi çok artırır.");
        } else if (month >= 5 && month <= 8) { // Jun-Sep
            savingsTips.push("☀️ Klima kullanımı tüketimi %10-20 artırabilir. Şehir içinde cam açmak daha verimli olabilir.");
        }

        return {
            avgDailyKm,
            nextRefuelDate,
            nextService,
            estimatedMonthlyCost,
            thisMonthCost,
            anomaly,
            savingsTips,
            weeklyChange,
            avgConsumption
        };
    }, [logs, maintenanceItems, vehicleParts, currentOdometer]);

    if (!predictions) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI Asistanı</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Akıllı analizler ve tahminler</p>
                </div>
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

                {/* Maintenance/Part Prediction */}
                <div className={`p-3 rounded-xl border backdrop-blur-sm ${predictions.nextService?.type === 'maintenance' && new Date(predictions.nextService.date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                    ? 'bg-red-50/80 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                    : 'bg-white/60 dark:bg-gray-800/60 border-white/50 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <AlertTriangle className={`w-3 h-3 ${predictions.nextService?.type === 'maintenance' ? 'text-orange-500' : 'text-gray-500'}`} />
                        Sıradaki İşlem
                    </div>
                    {predictions.nextService ? (
                        <>
                            <div className="text-sm font-semibold text-gray-800 dark:text-white truncate" title={predictions.nextService.title}>
                                {predictions.nextService.title}
                            </div>
                            <p className="text-[10px] text-primary-500 font-medium mt-1">
                                {predictions.nextService.date.toLocaleDateString('tr-TR')} (Tahmini)
                            </p>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400">Planlı işlem yok</span>
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

                {/* Weekly Performance */}
                <div className={`p-3 rounded-xl border backdrop-blur-sm ${predictions.weeklyChange > 0
                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                    : 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'}`}>
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        {predictions.weeklyChange > 0
                            ? <TrendingUp className="w-3 h-3 text-red-500" />
                            : <TrendingUp className="w-3 h-3 text-green-500 transform rotate-180" />}
                        Haftalık Trend
                    </div>
                    <div className={`text-sm font-semibold ${predictions.weeklyChange > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                        {Math.abs(predictions.weeklyChange).toFixed(1)}% {predictions.weeklyChange > 0 ? 'Artış' : 'Düşüş'}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Önceki haftaya göre maliyet</p>
                </div>
            </div>

            {/* Anomaly Alert Banner */}
            {predictions.anomaly.type && (
                <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 ${predictions.anomaly.type === 'high'
                    ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${predictions.anomaly.type === 'high' ? 'bg-red-100 dark:bg-red-800' : 'bg-green-100 dark:bg-green-800'
                        }`}>
                        {predictions.anomaly.type === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${predictions.anomaly.type === 'high' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
                            }`}>
                            {predictions.anomaly.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Ortalama tüketim: {predictions.avgConsumption.toFixed(1)} L/100km
                        </p>
                    </div>
                </div>
            )}

            {/* Savings Tips */}
            {predictions.savingsTips.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">💡 Akıllı Öneriler</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {predictions.savingsTips.slice(0, 4).map((tip, i) => (
                            <p key={i} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                                <span className="mt-0.5">•</span>
                                <span>{tip}</span>
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
