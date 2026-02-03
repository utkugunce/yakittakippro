import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { DailyLog } from '../../../../types';

interface CorrelationChartProps {
    logs: DailyLog[];
}

export const CorrelationChart: React.FC<CorrelationChartProps> = ({ logs }) => {
    // Filter logs that have both speed and consumption data
    const data = logs
        .filter(log => log.avgSpeed && log.avgSpeed > 0 && log.avgConsumption > 0)
        .map(log => ({
            speed: log.avgSpeed,
            consumption: log.avgConsumption,
            date: new Date(log.date).toLocaleDateString('tr-TR'),
        }));

    if (data.length < 5) return null;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis
                        type="number"
                        dataKey="speed"
                        name="Hız"
                        unit=" km/s"
                        label={{ value: 'Ortalama Hız (km/s)', position: 'bottom', offset: 0 }}
                    />
                    <YAxis
                        type="number"
                        dataKey="consumption"
                        name="Tüketim"
                        unit=" L"
                        label={{ value: 'Tüketim (L/100km)', angle: -90, position: 'left' }}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{data.date}</p>
                                        <div className="space-y-1 mt-2">
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                Hız: <span className="font-medium">{data.speed} km/s</span>
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                Tüketim: <span className="font-medium">{data.consumption} L/100km</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter
                        name="Sürüşler"
                        data={data}
                        fill="#8884d8"
                        shape="circle"

                    >
                        {/* Dynamic coloring based on efficiency could be cool here */}
                        {data.map((entry, index) => (
                            <cell key={`cell-${index}`} fill={entry.consumption > 8 ? '#EF4444' : '#10B981'} />
                        ))}
                    </Scatter>
                    {/* Trend Line (Manual approximation or library? Keeping simple for now with average) */}
                    {/* <ReferenceLine y={8} stroke="red" strokeDasharray="3 3" /> */}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
