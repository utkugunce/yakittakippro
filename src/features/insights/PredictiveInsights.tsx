import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Lightbulb, Calendar, Fuel, Wrench } from 'lucide-react';
import { DailyLog, FuelPurchase, MaintenanceItem } from '../../types';

interface PredictiveInsightsProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    maintenanceItems: MaintenanceItem[];
    currentOdometer: number;
    monthlyBudget?: number;
}

interface Insight {
    id: string;
    type: 'prediction' | 'warning' | 'tip' | 'reminder';
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    title: string;
    message: string;
    details?: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
    logs,
    purchases,
    maintenanceItems,
    currentOdometer,
    monthlyBudget = 0
}) => {
    const insights = useMemo(() => {
        const result: Insight[] = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        // --- 1. Aylık Harcama Tahmini ---
        const thisMonthPurchases = purchases.filter(p => {
            const date = new Date(p.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        const thisMonthSpent = thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

        // Günlük ortalama harcama
        const dailyAvgSpent = dayOfMonth > 0 ? thisMonthSpent / dayOfMonth : 0;
        const projectedMonthlySpend = dailyAvgSpent * daysInMonth;

        if (projectedMonthlySpend > 0) {
            const overBudget = monthlyBudget > 0 && projectedMonthlySpend > monthlyBudget;
            const budgetDiff = monthlyBudget > 0 ? projectedMonthlySpend - monthlyBudget : 0;

            result.push({
                id: 'monthly-prediction',
                type: 'prediction',
                icon: overBudget ? AlertTriangle : TrendingUp,
                iconColor: overBudget ? 'text-orange-500' : 'text-blue-500',
                bgColor: overBudget ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
                title: 'Ay Sonu Tahmini',
                message: `Mevcut hızla ay sonunda tahmini ₺${projectedMonthlySpend.toFixed(0)} harcayacaksın.`,
                details: overBudget
                    ? `Hedefin ₺${monthlyBudget} ise, ₺${budgetDiff.toFixed(0)} fazla olacak. Günlük kullanımı azaltmayı dene!`
                    : monthlyBudget > 0
                        ? `Bütçenin ₺${monthlyBudget} altında kalıyorsun, harika! 👏`
                        : `Şu ana kadar ₺${thisMonthSpent.toFixed(0)} harcadın, ${daysRemaining} gün kaldı.`
            });
        }

        // --- 2. Günlük KM Trendi ---
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedLogs.length >= 14) {
            const last7Days = sortedLogs.slice(0, 7);
            const prev7Days = sortedLogs.slice(7, 14);

            const avgLast7 = last7Days.reduce((sum, l) => sum + l.dailyDistance, 0) / 7;
            const avgPrev7 = prev7Days.reduce((sum, l) => sum + l.dailyDistance, 0) / 7;

            if (avgPrev7 > 0) {
                const kmChange = ((avgLast7 - avgPrev7) / avgPrev7) * 100;

                if (Math.abs(kmChange) > 15) {
                    const isIncrease = kmChange > 0;
                    result.push({
                        id: 'km-trend',
                        type: 'prediction',
                        icon: isIncrease ? TrendingUp : TrendingDown,
                        iconColor: isIncrease ? 'text-amber-500' : 'text-green-500',
                        bgColor: isIncrease ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20',
                        title: 'Kullanım Trendi',
                        message: `Son 7 günde günlük ortalama ${avgLast7.toFixed(0)} km - ${isIncrease ? 'artış' : 'düşüş'} var.`,
                        details: isIncrease
                            ? `Önceki haftaya göre %${Math.abs(kmChange).toFixed(0)} fazla kullanım. Bu hızla yakıt masrafın artacak.`
                            : `Önceki haftaya göre %${Math.abs(kmChange).toFixed(0)} az kullanım. Tasarruf yapıyorsun! 🎉`
                    });
                }
            }
        }

        // --- 3. Tüketim Analizi ---
        const consumptionLogs = logs.filter(l => l.avgConsumption > 0);
        if (consumptionLogs.length >= 5) {
            const avgConsumption = consumptionLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / consumptionLogs.length;
            const lastConsumption = consumptionLogs[0]?.avgConsumption || 0;

            if (lastConsumption > avgConsumption * 1.2) {
                result.push({
                    id: 'high-consumption',
                    type: 'warning',
                    icon: AlertTriangle,
                    iconColor: 'text-red-500',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    title: 'Yüksek Tüketim Uyarısı',
                    message: `Son tüketim ${lastConsumption.toFixed(1)} L/100km - ortalamanın %${((lastConsumption / avgConsumption - 1) * 100).toFixed(0)} üstünde.`,
                    details: 'Lastik basıncını kontrol et, klima kullanımını azalt, ani fren/hızlanmadan kaçın.'
                });
            } else if (lastConsumption < avgConsumption * 0.85 && lastConsumption > 0) {
                result.push({
                    id: 'efficient-driving',
                    type: 'tip',
                    icon: Lightbulb,
                    iconColor: 'text-green-500',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    title: 'Verimli Sürüş! 🌟',
                    message: `Son tüketim ${lastConsumption.toFixed(1)} L/100km - ortalamanın altında.`,
                    details: 'Harika gidiyorsun! Bu sürüş tarzını korumaya devam et.'
                });
            }
        }

        // --- 4. Yakıt Alımı Tahmini ---
        const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedPurchases.length >= 3) {
            // Ortalama alım miktarı ve sıklığı
            const avgLiters = sortedPurchases.slice(0, 5).reduce((sum, p) => sum + p.liters, 0) / Math.min(5, sortedPurchases.length);
            
            let totalDays = 0;
            for (let i = 0; i < Math.min(4, sortedPurchases.length - 1); i++) {
                const diff = (new Date(sortedPurchases[i].date).getTime() - new Date(sortedPurchases[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
                totalDays += diff;
            }
            const avgDaysBetween = totalDays / Math.min(4, sortedPurchases.length - 1);

            const lastPurchaseDate = new Date(sortedPurchases[0].date);
            const daysSinceLast = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysUntilNext = Math.max(0, Math.round(avgDaysBetween - daysSinceLast));

            if (daysUntilNext <= 3 && daysUntilNext >= 0) {
                result.push({
                    id: 'fuel-reminder',
                    type: 'reminder',
                    icon: Fuel,
                    iconColor: 'text-emerald-500',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                    title: 'Yakıt Hatırlatması',
                    message: daysUntilNext === 0 
                        ? 'Bugün yakıt alma günün! ⛽'
                        : `Tahminen ${daysUntilNext} gün sonra yakıt alman gerekecek.`,
                    details: `Genelde ~${avgLiters.toFixed(0)}L alıyorsun, ${Math.round(avgDaysBetween)} günde bir.`
                });
            }
        }

        // --- 5. Bakım Hatırlatmaları ---
        maintenanceItems.forEach(item => {
            let shouldRemind = false;
            let remaining = '';
            let urgency = 'normal';

            if (item.type === 'km' || item.type === 'both') {
                if (item.nextDueKm) {
                    const kmRemaining = item.nextDueKm - currentOdometer;
                    if (kmRemaining <= 1000 && kmRemaining > 0) {
                        shouldRemind = true;
                        remaining = `${kmRemaining} km`;
                        if (kmRemaining <= 300) urgency = 'high';
                    }
                }
            }

            if (!shouldRemind && (item.type === 'date' || item.type === 'both')) {
                if (item.dueDate) {
                    const dueDate = new Date(item.dueDate);
                    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysRemaining <= 14 && daysRemaining > 0) {
                        shouldRemind = true;
                        remaining = `${daysRemaining} gün`;
                        if (daysRemaining <= 3) urgency = 'high';
                    }
                }
            }

            if (shouldRemind) {
                result.push({
                    id: `maint-${item.id}`,
                    type: 'reminder',
                    icon: Wrench,
                    iconColor: urgency === 'high' ? 'text-red-500' : 'text-purple-500',
                    bgColor: urgency === 'high' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-purple-50 dark:bg-purple-900/20',
                    title: item.title,
                    message: `${remaining} sonra bakım gerekiyor.`,
                    details: urgency === 'high' 
                        ? 'Acil! Randevu almayı unutma!' 
                        : 'Şimdiden planlamak iyi olabilir.'
                });
            }
        });

        // --- 6. Tasarruf İpuçları ---
        if (result.length < 3 && purchases.length >= 5) {
            const avgPrice = purchases.slice(0, 10).reduce((sum, p) => sum + p.pricePerLiter, 0) / Math.min(10, purchases.length);
            const lastPrice = sortedPurchases[0]?.pricePerLiter || 0;

            if (lastPrice > avgPrice * 1.05) {
                result.push({
                    id: 'price-tip',
                    type: 'tip',
                    icon: Lightbulb,
                    iconColor: 'text-yellow-500',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    title: 'Fiyat İpucu',
                    message: `Son aldığın fiyat (₺${lastPrice.toFixed(2)}) ortalamanın üstünde.`,
                    details: 'Farklı istasyonları karşılaştırmayı dene, fiyatlar günlük değişebilir.'
                });
            }
        }

        return result;
    }, [logs, purchases, maintenanceItems, currentOdometer, monthlyBudget]);

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Akıllı Öngörüler</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Verilerine dayalı tahminler</p>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {insights.slice(0, 4).map((insight) => {
                    const Icon = insight.icon;
                    return (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-xl ${insight.bgColor} transition-all hover:scale-[1.01]`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-white/60 dark:bg-gray-800/60 ${insight.iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-0.5">
                                        {insight.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                                        {insight.message}
                                    </p>
                                    {insight.details && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            {insight.details}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show more if needed */}
            {insights.length > 4 && (
                <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400">
                        +{insights.length - 4} daha fazla öneri
                    </span>
                </div>
            )}
        </div>
    );
};
