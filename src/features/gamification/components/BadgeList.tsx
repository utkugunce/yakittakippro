import React from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { Award, Flag, Medal, Crown, Flame, Shield, Lock } from 'lucide-react';
import { Badge } from '../types';

// Icon mapper
const IconMap: Record<string, React.ElementType> = {
    Flag,
    Award,
    Medal,
    Crown,
    Flame,
    Shield,
};

export const BadgeList: React.FC = () => {
    const { badges } = useGamificationStore();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors">Başarımlar & Rozetler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                    const isUnlocked = !!badge.unlockedAt;
                    const IconComponent = IconMap[badge.iconName] || Award;

                    return (
                        <div
                            key={badge.id}
                            className={`
                relative p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all duration-300
                ${isUnlocked
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60 grayscale'}
              `}
                        >
                            <div className={`
                p-3 rounded-full transition-colors
                ${isUnlocked ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-200 dark:bg-gray-700'}
              `}>
                                <IconComponent
                                    className={`w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}
                                    fill={isUnlocked && badge.iconName !== 'Flag' ? 'currentColor' : 'none'}
                                />
                            </div>

                            <div>
                                <h4 className={`font-bold text-sm ${isUnlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {badge.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.description}</p>
                            </div>

                            {isUnlocked && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                </div>
                            )}

                            {!isUnlocked && (
                                <div className="absolute top-2 right-2 text-gray-300 dark:text-gray-600">
                                    <Lock className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
