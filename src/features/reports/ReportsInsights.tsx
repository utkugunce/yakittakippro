import React, { useMemo } from 'react';
import { DailyLog } from '../../../types';
import { FuelPurchase } from '../../../FuelPurchaseForm';
import { Lightbulb, TrendingUp, Target, Wallet, Fuel, Calendar, ArrowRight } from 'lucide-react';

interface InsightsProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
}

// Tasarruf İpuçları
export const SavingsInsights: React.FC<InsightsProps> = ({ logs, purchases }) => {
    const insights = useMemo(() => {
        const tips: Array<{ icon: React.ReactNode; title: string; description: string; savings?: string }> = [];

        if (logs.length < 3 && purchases.length < 3) return tips;

        // 1. Station price comparison tip
        const stationPrices: Record<string, number[]> = {};
        purchases.forEach(p => {
            if (p.station && p.pricePerLiter > 0) {
                if (!stationPrices[p.station]) stationPrices[p.station] = [];
                stationPrices[p.station].push(p.pricePerLiter);
            }
        });
        logs.forEach(l => {
            if (l.fuelStation && l.fuelPrice > 0) {
                if (!stationPrices[l.fuelStation]) stationPrices[l.fuelStation] = [];
                stationPrices[l.fuelStation].push(l.fuelPrice);
            }
        });

        const avgPrices = Object.entries(stationPrices).map(([name, prices]) => ({
            name,
            avg: prices.reduce((a, b) => a + b, 0) / prices.length
        })).sort((a, b) => a.avg - b.avg);

        if (avgPrices.length >= 2) {
            const cheapest = avgPrices[0];
            const mostExpensive = avgPrices[avgPrices.length - 1];
            const diff = mostExpensive.avg - cheapest.avg;
            if (diff > 0.5) {
                tips.push({
                    icon: <Fuel className="w-4 h-4" />,
                    title: `${cheapest.name} tercih edin`,
                    description: `En uygun fiyatı ${cheapest.name} sunuyor (₺${cheapest.avg.toFixed(2)}/L)`,
                    savings: `₺${diff.toFixed(2)}/L tasarruf`
                });
            }
        }

        // 2. Consumption trend tip
        const validLogs = logs.filter(l => l.avgConsumption > 0);
        if (validLogs.length >= 5) {
            const recentAvg = validLogs.slice(-5).reduce((sum, l) => sum + l.avgConsumption, 0) / 5;
            const overallAvg = validLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / validLogs.length;

            if (recentAvg > overallAvg * 1.1) {
                tips.push({
                    icon: <TrendingUp className="w-4 h-4" />,
                    title: 'Tüketim artışı tespit edildi',
                    description: 'Son kayıtlarda tüketim ortalamanın üzerinde. Lastik basıncı ve sürüş alışkanlıklarını kontrol edin.',
                });
            }
        }

        // 3. Refuel timing tip
        const refuelDays = logs.filter(l => l.isRefuelDay);
        if (refuelDays.length >= 3) {
            const avgDistance = refuelDays.reduce((sum, l) => sum + l.dailyDistance, 0) / refuelDays.length;
            if (avgDistance < 300) {
                tips.push({
                    icon: <Target className="w-4 h-4" />,
                    title: 'Depoyu tam doldurun',
                    description: 'Sık yakıt alma yerine depoyu doldurarak istasyon ziyaretlerini azaltabilirsiniz.',
                });
            }
        }

        // 4. Weekly pattern tip
        const dayStats: Record<number, number> = {};
        logs.forEach(l => {
            const day = new Date(l.date).getDay();
            dayStats[day] = (dayStats[day] || 0) + l.dailyCost;
        });

        const weekendCost = (dayStats[0] || 0) + (dayStats[6] || 0);
        const weekdayCost = Object.entries(dayStats).filter(([d]) => d !== '0' && d !== '6').reduce((sum, [, cost]) => sum + cost, 0);

        if (weekendCost > weekdayCost * 0.5 && weekendCost > 500) {
            tips.push({
                icon: <Calendar className="w-4 h-4" />,
                title: 'Hafta sonu harcamaları yüksek',
                description: 'Hafta sonu seyahatlerini planlamak tasarruf sağlayabilir.',
            });
        }

        // 5. General eco-driving tip
        if (tips.length < 2) {
            tips.push({
                icon: <Wallet className="w-4 h-4" />,
                title: 'Ekonomik sürüş ipucu',
                description: 'Sabit hızda sürüş yakıt tüketimini %15-20 azaltabilir. Ani hızlanma ve frenlerden kaçının.',
            });
        }

        return tips.slice(0, 4);
    }, [logs, purchases]);

    if (insights.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300">Tasarruf İpuçları</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Verilerinize dayalı öneriler</p>
                </div>
            </div>

            <div className="space-y-3">
                {insights.map((tip, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                            {tip.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{tip.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tip.description}</p>
                            {tip.savings && (
                                <span className="inline-block mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                                    {tip.savings}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Yıl Sonu Tahmini
export const YearEndProjection: React.FC<InsightsProps> = ({ logs, purchases }) => {
    const projection = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const dayOfYear = Math.floor((now.getTime() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const daysInYear = 365;
        const remainingDays = daysInYear - dayOfYear;

        // This year data
        const thisYearLogs = logs.filter(l => new Date(l.date).getFullYear() === currentYear);
        const thisYearPurchases = purchases.filter(p => new Date(p.date).getFullYear() === currentYear);

        const ytdCost = thisYearLogs.reduce((sum, l) => sum + l.dailyCost, 0) + thisYearPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const ytdDistance = thisYearLogs.reduce((sum, l) => sum + l.dailyDistance, 0);
        const ytdFuel = thisYearLogs.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) + thisYearPurchases.reduce((sum, p) => sum + p.liters, 0);

        if (dayOfYear < 15 || ytdCost < 100) return null;

        const dailyAvgCost = ytdCost / dayOfYear;
        const dailyAvgDistance = ytdDistance / dayOfYear;
        const dailyAvgFuel = ytdFuel / dayOfYear;

        const projectedCost = Math.round(ytdCost + (dailyAvgCost * remainingDays));
        const projectedDistance = Math.round(ytdDistance + (dailyAvgDistance * remainingDays));
        const projectedFuel = Math.round(ytdFuel + (dailyAvgFuel * remainingDays));

        // Last year comparison
        const lastYear = currentYear - 1;
        const lastYearLogs = logs.filter(l => new Date(l.date).getFullYear() === lastYear);
        const lastYearPurchases = purchases.filter(p => new Date(p.date).getFullYear() === lastYear);
        const lastYearCost = lastYearLogs.reduce((sum, l) => sum + l.dailyCost, 0) + lastYearPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

        return {
            ytdCost,
            ytdDistance,
            ytdFuel,
            projectedCost,
            projectedDistance,
            projectedFuel,
            dailyAvgCost,
            remainingDays,
            dayOfYear,
            lastYearCost: lastYearCost > 0 ? lastYearCost : null,
            changeFromLastYear: lastYearCost > 0 ? ((projectedCost - lastYearCost) / lastYearCost) * 100 : null
        };
    }, [logs, purchases]);

    if (!projection) return null;

    return (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                    <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-violet-800 dark:text-violet-300">Yıl Sonu Tahmini</h3>
                    <p className="text-xs text-violet-600 dark:text-violet-400">{projection.remainingDays} gün kaldı</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Yıl İlerlemesi</span>
                    <span>{Math.round((projection.dayOfYear / 365) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(projection.dayOfYear / 365) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Şu Ana Kadar</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                        ₺{projection.ytdCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="text-center p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">Yıl Sonu Tahmini</p>
                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">
                        ₺{projection.projectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm p-3 bg-white/40 dark:bg-black/10 rounded-lg">
                <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600 dark:text-gray-400">Tahmini Mesafe:</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">
                    {projection.projectedDistance.toLocaleString('tr-TR')} km
                </span>
            </div>

            {projection.changeFromLastYear !== null && (
                <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Geçen yıla göre:</span>
                        <span className={`font-bold ${projection.changeFromLastYear > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {projection.changeFromLastYear > 0 ? '+' : ''}{projection.changeFromLastYear.toFixed(0)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

