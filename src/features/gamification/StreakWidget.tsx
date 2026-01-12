import React from 'react';
import { Flame } from 'lucide-react';
import { useGamificationStore } from '../../stores/gamificationStore';

export const StreakWidget: React.FC = () => {
    const { currentStreak, longestStreak, lastActivityDate } = useGamificationStore();

    const isActiveToday = lastActivityDate
        ? new Date(lastActivityDate).toDateString() === new Date().toDateString()
        : false;

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-white/20 rounded-lg ${isActiveToday ? 'animate-pulse' : ''}`}>
                        <Flame className={`w-6 h-6 ${isActiveToday ? 'text-yellow-300' : 'text-white/70'}`} />
                    </div>
                    <div>
                        <p className="text-xs text-white/70 font-medium">Günlük Seri</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-bold">{currentStreak}</span>
                            <span className="text-sm text-white/70">gün</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-white/70">En Uzun</p>
                    <p className="text-lg font-semibold">{longestStreak} gün</p>
                </div>
            </div>

            {!isActiveToday && currentStreak > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white/80 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Bugün henüz kayıt eklemedin! Serini koru.
                    </p>
                </div>
            )}

            {currentStreak >= 7 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white/80 flex items-center">
                        <span className="mr-1">🔥</span>
                        Muhteşem gidiyorsun! {currentStreak} günlük seri!
                    </p>
                </div>
            )}
        </div>
    );
};
