import React, { useEffect } from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { Flame } from 'lucide-react';

export const StreakWidget: React.FC = () => {
    const { stats, updateStreak } = useGamificationStore();

    useEffect(() => {
        // Check streak on mount
        updateStreak();
    }, [updateStreak]);

    if (stats.currentStreak === 0) return null;

    return (
        <div className="group relative flex items-center gap-2 bg-white dark:bg-gray-800 pr-4 pl-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-sm opacity-20 rounded-full animate-pulse" />
                <div className="relative p-1.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full text-white shadow-sm">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                </div>
            </div>

            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">Seri</span>
                <span className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {stats.currentStreak} Gün
                </span>
            </div>

            {/* Tooltip hint on hover could go here, straightforward for now */}
        </div>
    );
};
