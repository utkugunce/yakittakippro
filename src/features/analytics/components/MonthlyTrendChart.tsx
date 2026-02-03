import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';

interface MonthlyTrendChartProps {
    data: Array<{
        name: string;
        maliyet: number;
        mesafe: number;
    }>;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 shadow-xl">
            <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-300">{p.name}:</span>
                    <span className="text-white font-bold">
                        {p.name === 'Maliyet' ? `₺${p.value.toLocaleString('tr-TR')}` : `${p.value.toLocaleString('tr-TR')} km`}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Custom legend
const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-6 mt-4">
        {payload?.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 dark:text-gray-400 font-medium">{entry.value}</span>
            </div>
        ))}
    </div>
);

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
    if (data.length < 2) return null;

    // Highlight the highest cost month
    const maxCostIndex = data.reduce((maxIdx, item, idx, arr) =>
        item.maliyet > arr[maxIdx].maliyet ? idx : maxIdx, 0);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8b5cf6', fontSize: 11 }}
                        tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                        width={55}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#10b981', fontSize: 11 }}
                        tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                        width={50}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                    <Legend content={<CustomLegend />} />
                    <Bar yAxisId="left" dataKey="maliyet" name="Maliyet" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {data.map((_, index) => (
                            <Cell
                                key={`maliyet-${index}`}
                                fill={index === maxCostIndex ? '#a855f7' : '#8b5cf6'}
                                fillOpacity={index === maxCostIndex ? 1 : 0.8}
                            />
                        ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="mesafe" name="Mesafe" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} fillOpacity={0.8} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
