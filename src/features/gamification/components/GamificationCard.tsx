import React from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { Trophy, Star } from 'lucide-react';

export const GamificationCard: React.FC = () => {
    const { stats } = useGamificationStore();

    // Calculate progress to next level
    // Level N starts at N*1000 XP
    // Current XP in level = totalXP % 1000
    const progress = (stats.totalXp % 1000) / 10; // 0 to 100
    const nextLevelXp = (stats.level) * 1000;
    const currentLevelXp = (stats.level - 1) * 1000;
    const xpInLevel = stats.totalXp - currentLevelXp;

    return (
        <div id="gamification-card" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg dark:shadow-gray-900/50">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-300" />
                    </div>
                    Sürücü Seviyesi
                </h3>
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full border border-white/20">
                    Level {stats.level}
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-white/90 font-medium">
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                        {stats.totalXp} XP
                    </span>
                    <span>{xpInLevel} / 1000 XP</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                        className="bg-yellow-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <p className="text-xs text-center text-white/70">
                    Sonraki seviye için {1000 - xpInLevel} XP daha kazan!
                </p>
            </div>
        </div >
    );
};
