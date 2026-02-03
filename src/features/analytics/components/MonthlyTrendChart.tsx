import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface MonthlyTrendChartProps {
    data: Array<{
        name: string;
        maliyet: number;
        mesafe: number;
    }>;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
    if (data.length < 2) return null;

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
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
                        tick={{ fill: 'var(--primary-500)', fontSize: 11 }}
                        tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#10b981', fontSize: 11 }}
                        tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v} km`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'Maliyet') return [`₺${value.toLocaleString('tr-TR')}`, name];
                            if (name === 'Mesafe') return [`${value.toLocaleString('tr-TR')} km`, name];
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="maliyet" name="Maliyet" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="mesafe" name="Mesafe" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
