import React, { useMemo } from 'react';
import { DailyLog, FuelPurchase } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, Sun, Snowflake, Fuel, TrendingDown, AlertTriangle, Zap, Gauge } from 'lucide-react';

interface AnalyticsProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    dateRange?: { start: Date; end: Date };
}

// Gün Bazlı Analiz
export const DayOfWeekAnalysis: React.FC<AnalyticsProps> = ({ logs, purchases, dateRange }) => {
    const data = useMemo(() => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const stats: Record<number, { distance: number; cost: number; count: number }> = {};

        // Initialize
        for (let i = 0; i < 7; i++) {
            stats[i] = { distance: 0, cost: 0, count: 0 };
        }

        // Filter and process logs
        const filteredLogs = dateRange
            ? logs.filter(l => {
                const d = new Date(l.date);
                return d >= dateRange.start && d <= dateRange.end;
            })
            : logs;

        filteredLogs.forEach(log => {
            const dayIndex = new Date(log.date).getDay();
            stats[dayIndex].distance += log.dailyDistance;
            stats[dayIndex].cost += log.dailyCost;
            stats[dayIndex].count++;
        });

        // Add purchases
        const filteredPurchases = dateRange
            ? purchases.filter(p => {
                const d = new Date(p.date);
                return d >= dateRange.start && d <= dateRange.end;
            })
            : purchases;

        filteredPurchases.forEach(p => {
            const dayIndex = new Date(p.date).getDay();
            stats[dayIndex].cost += p.totalAmount;
        });

        return days.map((name, i) => ({
            name: name.slice(0, 3),
            mesafe: Math.round(stats[i].distance),
            harcama: Math.round(stats[i].cost),
            kayit: stats[i].count
        }));
    }, [logs, purchases, dateRange]);

    const maxDay = data.reduce((prev, curr) => curr.mesafe > prev.mesafe ? curr : prev, data[0]);
    const minDay = data.filter(d => d.mesafe > 0).reduce((prev, curr) => curr.mesafe < prev.mesafe ? curr : prev, data[0]);

    if (logs.length < 7) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Gün Bazlı Analiz</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Haftanın günlerine göre dağılım</p>
                </div>
            </div>

            <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                            formatter={(value: number, name: string) => [
                                name === 'mesafe' ? `${value} km` : `₺${value.toLocaleString()}`,
                                name === 'mesafe' ? 'Mesafe' : 'Harcama'
                            ]}
                        />
                        <Bar dataKey="mesafe" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">En Yoğun Gün</p>
                    <p className="font-bold text-indigo-900 dark:text-indigo-200">{maxDay.name}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">{maxDay.mesafe} km</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">En Sakin Gün</p>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">{minDay.name}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{minDay.mesafe} km</p>
                </div>
            </div>
        </div>
    );
};

// Mevsimsel Analiz
export const SeasonalAnalysis: React.FC<AnalyticsProps> = ({ logs }) => {
    const data = useMemo(() => {
        const seasons: Record<string, { fuel: number; distance: number; count: number }> = {
            'Kış': { fuel: 0, distance: 0, count: 0 },
            'İlkbahar': { fuel: 0, distance: 0, count: 0 },
            'Yaz': { fuel: 0, distance: 0, count: 0 },
            'Sonbahar': { fuel: 0, distance: 0, count: 0 }
        };

        logs.forEach(log => {
            const month = new Date(log.date).getMonth();
            let season: string;
            if (month >= 2 && month <= 4) season = 'İlkbahar';
            else if (month >= 5 && month <= 7) season = 'Yaz';
            else if (month >= 8 && month <= 10) season = 'Sonbahar';
            else season = 'Kış';

            seasons[season].fuel += log.dailyFuelConsumed;
            seasons[season].distance += log.dailyDistance;
            seasons[season].count++;
        });

        return Object.entries(seasons).map(([name, stats]) => ({
            name,
            tuketim: stats.distance > 0 ? Number(((stats.fuel / stats.distance) * 100).toFixed(1)) : 0,
            kayit: stats.count,
            icon: name === 'Kış' ? '❄️' : name === 'Yaz' ? '☀️' : name === 'İlkbahar' ? '🌸' : '🍂'
        }));
    }, [logs]);

    const hasData = data.some(d => d.kayit > 0);
    if (!hasData) return null;

    const SEASON_STYLES = [
        { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-500' },
        { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-500' },
        { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-500' },
        { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-500' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Mevsimsel Analiz</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mevsime göre tüketim karşılaştırması</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.map((season, i) => (
                    <div
                        key={season.name}
                        className={`text-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group ${SEASON_STYLES[i].border} ${SEASON_STYLES[i].bg}`}
                    >
                        <span className="text-2xl">{season.icon}</span>
                        <p className="font-bold text-gray-800 dark:text-white mt-1">{season.name}</p>
                        <p className={`text-lg font-bold ${SEASON_STYLES[i].text}`}>
                            {season.tuketim > 0 ? `${season.tuketim} L` : '-'}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">/100km</p>
                    </div>
                ))}
            </div>

            {data.filter(d => d.tuketim > 0).length >= 2 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                    <Snowflake className="w-3 h-3 inline mr-1" />
                    Kış aylarında klima ve ısıtma kullanımı nedeniyle tüketim genellikle %5-15 artar.
                </div>
            )}
        </div>
    );
};

// İstasyon Fiyat Karşılaştırması
export const StationPriceComparison: React.FC<AnalyticsProps> = ({ logs, purchases }) => {
    const data = useMemo(() => {
        const stats: Record<string, { totalCost: number; totalLiters: number; count: number }> = {};

        logs.forEach(log => {
            if (log.fuelStation && log.fuelPrice > 0 && log.dailyFuelConsumed > 0) {
                if (!stats[log.fuelStation]) stats[log.fuelStation] = { totalCost: 0, totalLiters: 0, count: 0 };
                stats[log.fuelStation].totalCost += log.dailyCost;
                stats[log.fuelStation].totalLiters += log.dailyFuelConsumed;
                stats[log.fuelStation].count++;
            }
        });

        purchases.forEach(p => {
            if (p.station && p.pricePerLiter > 0) {
                if (!stats[p.station]) stats[p.station] = { totalCost: 0, totalLiters: 0, count: 0 };
                stats[p.station].totalCost += p.totalAmount;
                stats[p.station].totalLiters += p.liters;
                stats[p.station].count++;
            }
        });

        return Object.entries(stats)
            .map(([name, s]) => ({
                name,
                avgPrice: s.totalLiters > 0 ? Number((s.totalCost / s.totalLiters).toFixed(2)) : 0,
                totalSpent: Math.round(s.totalCost),
                count: s.count
            }))
            .filter(d => d.avgPrice > 0)
            .sort((a, b) => a.avgPrice - b.avgPrice);
    }, [logs, purchases]);

    if (data.length < 2) return null;

    const cheapest = data[0];
    const mostExpensive = data[data.length - 1];
    const priceDiff = mostExpensive.avgPrice - cheapest.avgPrice;
    const totalLiters = logs.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) + purchases.reduce((sum, p) => sum + p.liters, 0);
    const potentialSaving = priceDiff * totalLiters;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <Fuel className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">İstasyon Fiyat Analizi</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Marka bazlı ortalama litre fiyatı</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {data.slice(0, 5).map((station, i) => (
                    <div key={station.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center space-x-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                {i + 1}
                            </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{station.name}</span>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold ${i === 0 ? 'text-emerald-600' : 'text-gray-800 dark:text-white'}`}>
                                ₺{station.avgPrice}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">/L</span>
                        </div>
                    </div>
                ))}
            </div>

            {potentialSaving > 100 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start space-x-2">
                        <TrendingDown className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                Potansiyel Tasarruf: ₺{potentialSaving.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                Tüm yakıtı {cheapest.name}'den alsaydınız
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Anomali Tespiti
export const AnomalyDetection: React.FC<AnalyticsProps> = ({ logs, purchases }) => {
    const anomalies = useMemo(() => {
        const results: Array<{ type: string; date: string; value: number; avg: number; message: string }> = [];

        if (logs.length < 5) return results;

        // Calculate averages
        const avgCost = logs.reduce((sum, l) => sum + l.dailyCost, 0) / logs.length;
        const avgConsumption = logs.filter(l => l.avgConsumption > 0).reduce((sum, l) => sum + l.avgConsumption, 0) / logs.filter(l => l.avgConsumption > 0).length;

        // Check last 10 logs for anomalies
        const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        recentLogs.forEach(log => {
            // High cost anomaly (>2x average)
            if (log.dailyCost > avgCost * 2) {
                results.push({
                    type: 'high_cost',
                    date: log.date,
                    value: log.dailyCost,
                    avg: avgCost,
                    message: `Normalin ${((log.dailyCost / avgCost - 1) * 100).toFixed(0)}% üzerinde harcama`
                });
            }

            // High consumption anomaly
            if (log.avgConsumption > avgConsumption * 1.5 && log.avgConsumption > 0) {
                results.push({
                    type: 'high_consumption',
                    date: log.date,
                    value: log.avgConsumption,
                    avg: avgConsumption,
                    message: `Tüketim ortalamanın ${((log.avgConsumption / avgConsumption - 1) * 100).toFixed(0)}% üzerinde`
                });
            }
        });

        return results.slice(0, 3); // Max 3 anomalies
    }, [logs]);

    if (anomalies.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300">Dikkat Edilmesi Gerekenler</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Normal dışı harcamalar tespit edildi</p>
                </div>
            </div>

            <div className="space-y-3">
                {anomalies.map((anomaly, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                        <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{anomaly.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(anomaly.date).toLocaleDateString('tr-TR')} •
                                {anomaly.type === 'high_cost' ? ` ₺${anomaly.value.toFixed(0)} (ort: ₺${anomaly.avg.toFixed(0)})` : ` ${anomaly.value.toFixed(1)} L/100km (ort: ${anomaly.avg.toFixed(1)})`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Hız ve Verimlilik Analizi
export const SpeedEfficiencyAnalysis: React.FC<AnalyticsProps> = ({ logs }) => {
    const data = useMemo(() => {
        // Hız aralıkları (km/h)
        const ranges = [
            { min: 0, max: 50, label: '0-50', count: 0, totalCons: 0 },
            { min: 50, max: 90, label: '50-90', count: 0, totalCons: 0 },
            { min: 90, max: 120, label: '90-120', count: 0, totalCons: 0 },
            { min: 120, max: 999, label: '120+', count: 0, totalCons: 0 },
        ];

        logs.forEach(log => {
            if (log.avgSpeed && log.avgSpeed > 0 && log.avgConsumption > 0) {
                const range = ranges.find(r => log.avgSpeed! >= r.min && log.avgSpeed! < r.max);
                if (range) {
                    range.count++;
                    range.totalCons += log.avgConsumption;
                }
            }
        });

        return ranges
            .filter(r => r.count > 0)
            .map(r => ({
                name: r.label,
                consumption: Number((r.totalCons / r.count).toFixed(1)),
                count: r.count
            }));
    }, [logs]);

    if (data.length < 2) return null;

    // En verimli hız aralığını bul
    const bestRange = data.reduce((prev, curr) => curr.consumption < prev.consumption ? curr : prev, data[0]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Hız ve Verimlilik</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ortalama hıza göre yakıt tüketimi</p>
                </div>
            </div>

            <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'Hız (km/h)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#888' }}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                            formatter={(value: number) => [`${value} L/100km`, 'Tüketim']}
                        />
                        <Bar dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === bestRange.name ? '#10b981' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                <p>
                    <span className="font-bold">Öneri:</span> Aracınız en verimli tüketimi <span className="font-bold">{bestRange.name} km/h</span> hız aralığında ({bestRange.consumption} L/100km) yapıyor.
                </p>
            </div>
        </div>
    );
};
