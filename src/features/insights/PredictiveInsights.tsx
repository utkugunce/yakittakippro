import React, { useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, Fuel, Bell, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyLog, FuelPurchase, MaintenanceItem, VehiclePart } from '../../types';

interface InsightsPanelProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    maintenanceItems: MaintenanceItem[];
    vehicleParts: VehiclePart[];
    currentOdometer: number;
    monthlyBudget?: number;
}

interface Insight {
    id: string;
    type: 'prediction' | 'warning' | 'tip' | 'reminder' | 'alert';
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    title: string;
    message: string;
    details?: string;
    dismissible?: boolean;
}

export const PredictiveInsights: React.FC<InsightsPanelProps> = ({
    logs,
    purchases,
    maintenanceItems,
    vehicleParts,
    currentOdometer,
    monthlyBudget = 0
}) => {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState(false);

    const dismissItem = (id: string) => {
        setDismissedIds(prev => new Set(prev).add(id));
    };

    // Daily tips
    const dailyTips = [
        "Lastik basıncını düzenli kontrol etmek yakıt tüketimini %3'e kadar azaltabilir.",
        "Ani fren ve hızlanmalardan kaçınmak hem güvenlik hem de tasarruf sağlar.",
        "Klima kullanımı yakıt tüketimini yaklaşık %10 artırır.",
        "Düzenli bakım araç ömrünü uzatır ve beklenmedik masrafları önler.",
        "Sabit hızda sürüş en verimli yakıt tüketimini sağlar.",
        "Gereksiz yük taşımak yakıt tüketimini artırır.",
        "Motor ısındıktan sonra hareket etmek daha verimlidir."
    ];
    const todayTip = dailyTips[new Date().getDay() % dailyTips.length];

    const allInsights = useMemo(() => {
        const result: Insight[] = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // --- MAINTENANCE ALERTS (highest priority) ---
        maintenanceItems.forEach(item => {
            let shouldShow = false;
            let isCritical = false;
            let remainingText = '';
            let targetText = '';

            if (item.type === 'km' || item.type === 'both') {
                if (item.nextDueKm) {
                    const remaining = item.nextDueKm - currentOdometer;
                    if (remaining <= (item.notifyBeforeKm || 1000)) {
                        shouldShow = true;
                        isCritical = remaining < 0;
                        remainingText = isCritical ? `${Math.abs(remaining).toLocaleString()} km gecikti!` : `${remaining.toLocaleString()} km kaldı`;
                        targetText = `Hedef: ${item.nextDueKm.toLocaleString()} km`;
                    }
                }
            }
            if (!shouldShow && (item.type === 'date' || item.type === 'both')) {
                if (item.dueDate) {
                    const days = Math.ceil((new Date(item.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (days <= Math.min((item.notifyBeforeDays || 15), 15)) {
                        shouldShow = true;
                        isCritical = days < 0;
                        remainingText = isCritical ? `${Math.abs(days)} gün geçti!` : `${days} gün kaldı`;
                        targetText = `Tarih: ${new Date(item.dueDate).toLocaleDateString('tr-TR')}`;
                    }
                }
            }

            if (shouldShow) {
                result.push({
                    id: `maint-alert-${item.id}`,
                    type: 'alert',
                    icon: isCritical ? AlertCircle : AlertTriangle,
                    iconColor: isCritical ? 'text-red-500' : 'text-amber-500',
                    bgColor: isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
                    title: `${item.title} Bakımı`,
                    message: remainingText,
                    details: targetText,
                    dismissible: true
                });
            }
        });

        // Parts alerts
        vehicleParts.filter(part => {
            if (!part.lifespanKm || !part.isActive) return false;
            const dueKm = part.installKm + part.lifespanKm;
            return (dueKm - currentOdometer) <= 1000;
        }).forEach(part => {
            const remaining = (part.installKm + part.lifespanKm!) - currentOdometer;
            const isCritical = remaining < 0;
            result.push({
                id: `part-alert-${part.id}`,
                type: 'alert',
                icon: isCritical ? AlertCircle : AlertTriangle,
                iconColor: isCritical ? 'text-red-500' : 'text-amber-500',
                bgColor: isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
                title: `${part.name} (Parça)`,
                message: isCritical ? `${Math.abs(remaining).toLocaleString()} km gecikti!` : `${remaining.toLocaleString()} km kaldı`,
                details: `Hedef: ${(part.installKm + part.lifespanKm!).toLocaleString()} km`,
                dismissible: true
            });
        });

        // --- PREDICTIVE INSIGHTS ---

        // 1. Monthly spending prediction
        const thisMonthPurchases = purchases.filter(p => {
            const date = new Date(p.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        const thisMonthSpent = thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const dailyAvgSpent = dayOfMonth > 0 ? thisMonthSpent / dayOfMonth : 0;
        const projectedMonthlySpend = dailyAvgSpent * daysInMonth;

        if (projectedMonthlySpend > 0) {
            const overBudget = monthlyBudget > 0 && projectedMonthlySpend > monthlyBudget;
            result.push({
                id: 'monthly-prediction',
                type: 'prediction',
                icon: overBudget ? AlertTriangle : TrendingUp,
                iconColor: overBudget ? 'text-orange-500' : 'text-blue-500',
                bgColor: overBudget ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
                title: 'Ay Sonu Tahmini',
                message: `Bu hızla ay sonunda tahmini ₺${projectedMonthlySpend.toFixed(0)} harcayacaksın.`,
                dismissible: true
            });
        }

        // 2. Consumption trend
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
                    title: 'Yüksek Tüketim',
                    message: `Son tüketim ${lastConsumption.toFixed(1)} L/100km - ortalamanın %${((lastConsumption / avgConsumption - 1) * 100).toFixed(0)} üstünde.`,
                    details: 'Lastik basıncını kontrol et, klima kullanımını azalt.',
                    dismissible: true
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
                    dismissible: true
                });
            }
        }

        // 3. Fuel reminder
        const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (sortedPurchases.length >= 3) {
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
                    message: daysUntilNext === 0 ? 'Bugün yakıt alma günün! ⛽' : `Tahminen ${daysUntilNext} gün sonra yakıt alman gerekecek.`,
                    dismissible: true
                });
            }
        }

        // --- DAILY TIP (lowest priority, always at the end) ---
        result.push({
            id: 'daily-tip',
            type: 'tip',
            icon: Lightbulb,
            iconColor: 'text-emerald-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            title: 'Günün İpucu',
            message: todayTip,
            dismissible: true
        });

        return result;
    }, [logs, purchases, maintenanceItems, vehicleParts, currentOdometer, monthlyBudget, todayTip]);

    // Filter out dismissed items
    const visibleInsights = allInsights.filter(i => !dismissedIds.has(i.id));

    if (visibleInsights.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Bildirim Merkezi</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {visibleInsights.length} bildirim
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                </button>
            </div>

            {/* Insights List */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {visibleInsights.slice(0, 6).map((insight) => {
                        const Icon = insight.icon;
                        return (
                            <div
                                key={insight.id}
                                className={`${insight.type === 'tip' ? 'p-3' : 'p-4'} rounded-xl ${insight.bgColor} transition-all hover:scale-[1.01]`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-white/60 dark:bg-gray-800/60 ${insight.iconColor} shrink-0`}>
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
                                    {insight.dismissible && (
                                        <button
                                            onClick={() => dismissItem(insight.id)}
                                            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
                                            title="Kapat"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Show more if needed */}
                    {visibleInsights.length > 6 && (
                        <div className="mt-3 text-center">
                            <span className="text-xs text-gray-400">
                                +{visibleInsights.length - 6} daha fazla bildirim
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
