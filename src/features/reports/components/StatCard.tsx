import React from 'react';
import { StatSummary } from '../hooks/useReportData';

interface StatCardProps {
    title: string;
    icon: React.ReactNode;
    stat: StatSummary;
    unit: string;
    decimals?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, icon, stat, unit, decimals = 1 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{icon}</div>
            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{title}</h4>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <p className="text-[10px] uppercase text-green-600 dark:text-green-400 font-bold tracking-wide">Min</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{stat.min.toFixed(decimals)}</p>
                <p className="text-[9px] text-green-600 dark:text-green-400 opacity-80">{unit}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <p className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wide">Ort</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stat.avg.toFixed(decimals)}</p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 opacity-80">{unit}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                <p className="text-[10px] uppercase text-red-600 dark:text-red-400 font-bold tracking-wide">Max</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">{stat.max.toFixed(decimals)}</p>
                <p className="text-[9px] text-red-600 dark:text-red-400 opacity-80">{unit}</p>
            </div>
        </div>
    </div>
);
