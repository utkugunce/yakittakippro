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

// Custom tooltip for better mobile/dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.[0]) return null;

    return (
        <div className="bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 shadow-xl">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-lg">
                ₺{payload[0].value.toLocaleString('tr-TR')}
            </p>
            <p className="text-primary-400 text-xs mt-0.5">Günlük Maliyet</p>
        </div>
    );
};

export const CostChart: React.FC<CostChartProps> = ({ data }) => {
    if (data.length < 2) return null;

    // Calculate min/max for dynamic coloring
    const maxCost = Math.max(...data.map(d => d.maliyet));
    const avgCost = data.reduce((sum, d) => sum + d.maliyet, 0) / data.length;

    return (
        <div className="h-[280px] w-full">
            {/* Summary badges */}
            <div className="flex items-center gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <span className="font-medium">Ortalama:</span>
                    <span className="font-bold">₺{avgCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <span className="font-medium">Maksimum:</span>
                    <span className="font-bold">₺{maxCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorMaliyet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        dy={10}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="maliyet"
                        stroke="url(#strokeGradient)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMaliyet)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
