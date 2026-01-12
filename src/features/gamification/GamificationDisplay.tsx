import React, { useEffect, useState } from 'react';
import { Star, Flame, Trophy } from 'lucide-react';
import { useGamificationStore } from '../../stores/gamificationStore';

interface GamificationDisplayProps {
    compact?: boolean;
}

export const GamificationDisplay: React.FC<GamificationDisplayProps> = ({ compact = false }) => {
    const { totalXP, currentStreak, badges } = useGamificationStore();
    const [showXPGain, setShowXPGain] = useState(false);
    const [lastXP, setLastXP] = useState(totalXP);

    // Animate XP gain
    useEffect(() => {
        if (totalXP > lastXP) {
            setShowXPGain(true);
            setTimeout(() => setShowXPGain(false), 2000);
        }
        setLastXP(totalXP);
    }, [totalXP]);

    // XP level calculation
    const level = Math.floor(totalXP / 1000) + 1;
    const xpInCurrentLevel = totalXP % 1000;
    const xpProgress = (xpInCurrentLevel / 1000) * 100;

    if (compact) {
        return (
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-800 dark:text-white">{totalXP}</span>
                    <span className="text-xs text-gray-500">XP</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-gray-800 dark:text-white">{currentStreak}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-gray-800 dark:text-white">{badges.length}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
            {/* XP Gain Animation */}
            {showXPGain && (
                <div className="absolute top-2 right-2 animate-bounce text-yellow-300 font-bold text-lg">
                    +{totalXP - lastXP + (totalXP - lastXP)} XP! 🎉
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                        <p className="text-xs text-white/70 font-medium">Seviye {level}</p>
                        <p className="text-2xl font-bold">{totalXP.toLocaleString('tr-TR')} XP</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <div className="flex items-center space-x-1">
                            <Flame className="w-5 h-5 text-orange-300" />
                            <span className="text-xl font-bold">{currentStreak}</span>
                        </div>
                        <p className="text-[10px] text-white/70">Seri</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center space-x-1">
                            <Trophy className="w-5 h-5 text-yellow-300" />
                            <span className="text-xl font-bold">{badges.length}</span>
                        </div>
                        <p className="text-[10px] text-white/70">Rozet</p>
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-2">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>Seviye {level}</span>
                    <span>Seviye {level + 1}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
                <p className="text-xs text-white/70 text-center mt-1">
                    {1000 - xpInCurrentLevel} XP kaldı
                </p>
            </div>
        </div>
    );
};
