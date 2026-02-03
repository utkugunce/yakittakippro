import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Eye, EyeOff } from 'lucide-react';

interface ConsumptionChartProps {
    data: Array<{
        name: string;
        ortalamaTuketim: number;
        haftalikOrtalama: number;
        benzinFiyati: number;
    }>;
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
    const [visibleSeries, setVisibleSeries] = useState({
        daily: true,
        weekly: true,
        price: false
    });

    const toggleSeries = (key: keyof typeof visibleSeries) => {
        setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (data.length < 2) return null;

    return (
        <div>
            {/* Toggle Buttons */}
            <div className="flex flex-wrap gap-2 text-xs mb-4">
                <button
                    onClick={() => toggleSeries('daily')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.daily ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                >
                    {visibleSeries.daily ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>Günlük</span>
                </button>
                <button
                    onClick={() => toggleSeries('weekly')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.weekly ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                >
                    {visibleSeries.weekly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>Haftalık Ort.</span>
                </button>
                <button
                    onClick={() => toggleSeries('price')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.price ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                >
                    {visibleSeries.price ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>Benzin Fiyatı</span>
                </button>
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8b5cf6', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            unit=" L"
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#f59e0b', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            unit=" ₺"
                            hide={!visibleSeries.price}
                        />
                        <Tooltip
                            cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                            contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                            formatter={(value: number, name: string) => {
                                if (name.includes('Fiyat') || name.includes('TL')) {
                                    return [value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }), name];
                                }
                                return [`${value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`, name];
                            }}
                        />

                        {visibleSeries.daily && (
                            <Line
                                yAxisId="left"
                                name="Günlük (L)"
                                type="monotone"
                                dataKey="ortalamaTuketim"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        )}

                        {visibleSeries.weekly && (
                            <Line
                                yAxisId="left"
                                name="Haftalık Ort. (L)"
                                type="monotone"
                                dataKey="haftalikOrtalama"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        )}

                        {visibleSeries.price && (
                            <Line
                                yAxisId="right"
                                name="Benzin Fiyatı (TL)"
                                type="monotone"
                                dataKey="benzinFiyati"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1, stroke: "#fff" }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
