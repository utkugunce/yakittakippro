import React from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { Award, Flag, Medal, Crown, Flame, Shield, Lock, CheckCircle2 } from 'lucide-react';

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    Başarımlar & Rozetler
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {badges.filter(b => b.unlockedAt).length} / {badges.length} Kazanıldı
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                    const isUnlocked = !!badge.unlockedAt;
                    const IconComponent = IconMap[badge.iconName] || Award;

                    return (
                        <div
                            key={badge.id}
                            className={`
                                group relative p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300
                                ${isUnlocked
                                    ? 'bg-gradient-to-b from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/10 border-amber-200 dark:border-amber-800/50 shadow-sm hover:shadow-md hover:-translate-y-1'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-70 grayscale hover:opacity-100 hover:grayscale-0'
                                }
                            `}
                        >
                            <div className={`
                                relative p-4 rounded-2xl transition-all duration-500
                                ${isUnlocked
                                    ? 'bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40 shadow-inner'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }
                            `}>
                                <IconComponent
                                    className={`w-8 h-8 ${isUnlocked ? 'text-amber-600 dark:text-amber-400 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
                                    fill={isUnlocked && badge.iconName !== 'Flag' ? 'currentColor' : 'none'}
                                />
                                {isUnlocked && (
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full">
                                <h4 className={`font-bold text-sm mb-1 line-clamp-1 ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {badge.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 min-h-[2.5em]">
                                    {badge.description}
                                </p>
                            </div>

                            {!isUnlocked && (
                                <div className="absolute top-3 right-3 text-gray-300 dark:text-gray-600">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
