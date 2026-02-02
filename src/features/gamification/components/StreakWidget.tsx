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
        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800/50 shadow-sm transition-colors" title="Günlük Seri">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="font-bold text-sm">{stats.currentStreak} Gün</span>
        </div>
    );
};
