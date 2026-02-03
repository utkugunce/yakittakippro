import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface CostChartProps {
    data: Array<{
        name: string;
        maliyet: number;
    }>;
}

export const CostChart: React.FC<CostChartProps> = ({ data }) => {
    if (data.length < 2) return null;

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorMaliyet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                        formatter={(value: number) => [
                            value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
                            'Günlük Maliyet'
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="maliyet"
                        stroke="var(--primary-500)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMaliyet)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
