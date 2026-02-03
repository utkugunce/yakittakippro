import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface StationData {
    name: string;
    value: number;
}

interface StationPieChartProps {
    data: StationData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const COLOR_CLASSES = ['bg-blue-500', 'bg-emerald-400', 'bg-amber-400', 'bg-orange-400', 'bg-indigo-400'];

export const StationPieChart: React.FC<StationPieChartProps> = ({ data }) => {
    if (data.length === 0) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center">
            <div className="h-[250px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                            formatter={(value: number) => [`${value} Ziyaret`, 'Ziyaret Sayısı']}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
                <div className="space-y-3">
                    {data.map((station, index) => (
                        <div key={station.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${COLOR_CLASSES[index % COLOR_CLASSES.length]}`}></div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{station.name}</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{station.value} Ziyaret</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
