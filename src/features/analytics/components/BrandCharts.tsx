import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { DailyLog, FuelPurchase } from '../../../types';
import { DollarSign, Leaf, Trophy } from 'lucide-react';

interface BrandChartsProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
}

// Custom tooltip
const CustomTooltip = ({ active, payload, type }: any & { type: 'spend' | 'efficiency' }) => {
    if (!active || !payload?.[0]) return null;

    return (
        <div className="bg-gray-900/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 shadow-xl">
            <p className="text-white font-bold text-sm">{payload[0].payload.name}</p>
            <p className="text-gray-400 text-xs mt-1">
                {type === 'spend'
                    ? `₺${payload[0].value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
                    : `${payload[0].value.toFixed(1)} L/100km`
                }
            </p>
        </div>
    );
};

export const BrandCharts: React.FC<BrandChartsProps> = ({ logs, purchases }) => {
    const brandData = useMemo(() => {
        const stats: Record<string, { totalCost: number, totalDist: number, totalFuel: number, count: number }> = {};

        logs.forEach(log => {
            if (!log.fuelStation || log.dailyDistance <= 0 || log.dailyFuelConsumed <= 0) return;
            const brand = log.fuelStation;
            if (!stats[brand]) stats[brand] = { totalCost: 0, totalDist: 0, totalFuel: 0, count: 0 };
            stats[brand].totalCost += log.dailyCost;
            stats[brand].totalDist += log.dailyDistance;
            stats[brand].totalFuel += log.dailyFuelConsumed;
            stats[brand].count++;
        });

        purchases.forEach(p => {
            if (!p.station) return;
            const brand = p.station;
            if (!stats[brand]) stats[brand] = { totalCost: 0, totalDist: 0, totalFuel: 0, count: 0 };
            stats[brand].totalCost += p.totalAmount;
            stats[brand].totalFuel += p.liters;
            stats[brand].count++;
        });

        return Object.entries(stats)
            .map(([name, data]) => ({
                name,
                spend: data.totalCost,
                efficiency: data.totalDist > 0 ? (data.totalFuel / data.totalDist) * 100 : 0,
                count: data.count
            }))
            .filter(d => d.count >= 1)
            .sort((a, b) => b.spend - a.spend);
    }, [logs, purchases]);

    if (brandData.length === 0) return null;

    const efficiencyData = brandData.filter(d => d.efficiency > 1).sort((a, b) => a.efficiency - b.efficiency);
    const topSpender = brandData[0];
    const bestEfficiency = efficiencyData[0];

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">En Çok Harcama</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{topSpender?.name}</p>
                            <p className="text-xs text-gray-500">₺{topSpender?.spend.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
                {bestEfficiency && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">En Verimli</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{bestEfficiency.name}</p>
                                <p className="text-xs text-gray-500">{bestEfficiency.efficiency.toFixed(1)} L/100km</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spend by Brand */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">Marka Bazlı Harcama</h3>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={brandData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip type="spend" />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
                                <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={24}>
                                    {brandData.map((entry, index) => (
                                        <Cell
                                            key={`spend-${index}`}
                                            fill={index === 0 ? '#f59e0b' : '#fcd34d'}
                                            fillOpacity={1 - (index * 0.15)}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency by Brand */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">Marka Verimliliği</h3>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                            Düşük = Daha İyi
                        </span>
                    </div>
                    <div className="h-[220px] w-full flex items-center justify-center">
                        {efficiencyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={efficiencyData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                    <XAxis type="number" domain={[0, 'auto']} hide />
                                    <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip type="efficiency" />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                                    <Bar dataKey="efficiency" radius={[0, 6, 6, 0]} barSize={24}>
                                        {efficiencyData.map((_, index) => (
                                            <Cell
                                                key={`eff-${index}`}
                                                fill={index === 0 ? '#10b981' : '#34d399'}
                                                fillOpacity={1 - (index * 0.15)}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center p-4">
                                <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Veri bulunamadı</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Verimlilik için kayıtlara mesafe ve yakıt bilgisi ekleyin
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
