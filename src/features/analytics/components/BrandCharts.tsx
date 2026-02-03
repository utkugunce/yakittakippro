import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { DailyLog, FuelPurchase } from '../../../types';

interface BrandChartsProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
}

export const BrandCharts: React.FC<BrandChartsProps> = ({ logs, purchases }) => {
    const brandData = useMemo(() => {
        const stats: Record<string, { totalCost: number, totalDist: number, totalFuel: number, count: number }> = {};

        // Process Logs
        logs.forEach(log => {
            if (!log.fuelStation || log.dailyDistance <= 0 || log.dailyFuelConsumed <= 0) return;

            const brand = log.fuelStation;
            if (!stats[brand]) stats[brand] = { totalCost: 0, totalDist: 0, totalFuel: 0, count: 0 };

            stats[brand].totalCost += log.dailyCost;
            stats[brand].totalDist += log.dailyDistance;
            stats[brand].totalFuel += log.dailyFuelConsumed;
            stats[brand].count++;
        });

        // Process Purchases
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spend by Brand */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Marka Bazlı Harcama</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={brandData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Harcama']}
                            />
                            <Bar dataKey="spend" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Efficiency by Brand */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Marka Verimliliği (L/100km)</h3>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">Düşük daha iyi</span>
                        <span className="text-[10px] text-gray-400 mt-1">*Sadece günlük kayıtlardan</span>
                    </div>
                </div>
                <div className="h-[250px] w-full flex items-center justify-center">
                    {efficiencyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiencyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                <XAxis type="number" domain={[0, 'auto']} hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                    formatter={(value: number) => [`${value.toFixed(1)} L/100km`, 'Tüketim']}
                                />
                                <Bar dataKey="efficiency" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center p-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Görüntülenecek veri bulunamadı.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Verimlilik grafiği için Günlük Kayıtlara "İstasyon" ve "Yakıt" bilgisi girmelisiniz.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
