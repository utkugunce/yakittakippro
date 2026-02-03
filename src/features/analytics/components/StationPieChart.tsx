import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { MapPin } from 'lucide-react';

interface StationData {
    name: string;
    value: number;
}

interface StationPieChartProps {
    data: StationData[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];
const GRADIENT_BG_COLORS = [
    'bg-violet-100 dark:bg-violet-900/30',
    'bg-cyan-100 dark:bg-cyan-900/30',
    'bg-amber-100 dark:bg-amber-900/30',
    'bg-emerald-100 dark:bg-emerald-900/30',
    'bg-pink-100 dark:bg-pink-900/30'
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    return (
        <div className="bg-gray-900/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50 shadow-xl">
            <p className="text-white font-bold text-sm">{payload[0].name}</p>
            <p className="text-gray-400 text-xs mt-1">
                {payload[0].value} ziyaret ({((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%)
            </p>
        </div>
    );
};

export const StationPieChart: React.FC<StationPieChartProps> = ({ data }) => {
    if (data.length === 0) return null;

    // Add total to each item for percentage calculation
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const dataWithTotal = data.map(d => ({ ...d, total }));

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            {/* Pie Chart */}
            <div className="h-[200px] w-full lg:w-1/2 relative">
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{total}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataWithTotal}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {dataWithTotal.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-full lg:w-1/2 space-y-2">
                {data.map((station, index) => {
                    const percentage = ((station.value / total) * 100).toFixed(0);
                    return (
                        <div
                            key={station.name}
                            className={`flex items-center justify-between p-3 rounded-xl ${GRADIENT_BG_COLORS[index % GRADIENT_BG_COLORS.length]} transition-all hover:scale-[1.02] cursor-default`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white text-sm">{station.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{station.value} ziyaret</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-10 text-right">
                                    %{percentage}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
