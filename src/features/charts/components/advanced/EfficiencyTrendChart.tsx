import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { DailyLog } from '../../../../types';

interface EfficiencyTrendChartProps {
    logs: DailyLog[];
}

export const EfficiencyTrendChart: React.FC<EfficiencyTrendChartProps> = ({ logs }) => {
    const data = useMemo(() => {
        // Sort logs by date ascending
        const sortedLogs = [...logs]
            .filter(l => l.avgConsumption > 0)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate moving average
        const windowSize = 5;
        return sortedLogs.map((log, index, array) => {
            const start = Math.max(0, index - windowSize + 1);
            const subset = array.slice(start, index + 1);
            const movingAvg = subset.reduce((sum, item) => sum + item.avgConsumption, 0) / subset.length;

            return {
                date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                consumption: log.avgConsumption,
                movingAvg: parseFloat(movingAvg.toFixed(1))
            };
        });
    }, [logs]);

    if (data.length < 3) return null;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis unit="L" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-violet-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Anlık:</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{payload[0].value} L</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Ortalama (5 gün):</span>
                                                <span className="font-bold text-orange-500">{payload[1].value} L</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="consumption"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorConsumption)"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="movingAvg"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
