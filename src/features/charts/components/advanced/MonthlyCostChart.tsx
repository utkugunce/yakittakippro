import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { FuelPurchase } from '../../../../types';
import { formatCurrency } from '../../../../utils/dateUtils'; // Assuming this exists or I will use Intl directly

interface MonthlyCostChartProps {
    purchases: FuelPurchase[];
}

export const MonthlyCostChart: React.FC<MonthlyCostChartProps> = ({ purchases }) => {
    const data = useMemo(() => {
        const monthlyMap = new Map<string, { month: string; fuel: number; maintenance: number }>();

        // Init last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
            monthlyMap.set(key, { month: label, fuel: 0, maintenance: 0 });
        }

        purchases.forEach(p => {
            const d = new Date(p.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap.has(key)) {
                const existing = monthlyMap.get(key)!;
                existing.fuel += p.totalAmount;
                monthlyMap.set(key, existing);
            }
        });

        return Array.from(monthlyMap.values());
    }, [purchases]);

    if (data.every(d => d.fuel === 0)) return null;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                                        {payload.map((entry: any) => (
                                            <div key={entry.name} className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span className="text-gray-600 dark:text-gray-300 capitalize">
                                                    {entry.name === 'fuel' ? 'Yakıt' : 'Bakım'}:
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.value)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-gray-900 dark:text-white">Toplam</span>
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                                                        payload.reduce((acc, curr) => acc + (curr.value as number), 0)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="fuel"
                        name="Yakıt"
                        stackId="a"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                    {/* Placeholder for future maintenance cost integration */}
                    <Bar
                        dataKey="maintenance"
                        name="Bakım"
                        stackId="a"
                        fill="#F59E0B"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
