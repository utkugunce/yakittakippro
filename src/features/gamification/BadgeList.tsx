import React, { useState } from 'react';
import { Trophy, Lock, X } from 'lucide-react';
import { useGamificationStore, getAllBadges, Badge } from '../../stores/gamificationStore';

export const BadgeList: React.FC = () => {
    const { badges: unlockedBadges } = useGamificationStore();
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const allBadges = getAllBadges();
    const unlockedIds = new Set(unlockedBadges.map(b => b.id));

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-gray-800 dark:text-white">Rozetler</h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {unlockedBadges.length}/{allBadges.length}
                    </span>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                        {allBadges.map(badge => {
                            const isUnlocked = unlockedIds.has(badge.id);
                            const unlockedVersion = unlockedBadges.find(b => b.id === badge.id);

                            return (
                                <button
                                    key={badge.id}
                                    onClick={() => setSelectedBadge(unlockedVersion || badge)}
                                    className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all
                    ${isUnlocked
                                            ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 hover:scale-105 shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-700/50 opacity-50 hover:opacity-70'
                                        }
                  `}
                                >
                                    <span className="text-2xl mb-1">
                                        {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
                                    </span>
                                    <span className={`text-[10px] font-medium text-center leading-tight ${isUnlocked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {badge.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-5xl mb-4">
                            {unlockedIds.has(selectedBadge.id) ? selectedBadge.icon : '🔒'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {selectedBadge.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {selectedBadge.description}
                        </p>

                        {unlockedIds.has(selectedBadge.id) && selectedBadge.unlockedAt && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ {new Date(selectedBadge.unlockedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
                            </p>
                        )}

                        {!unlockedIds.has(selectedBadge.id) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Henüz kazanılmadı
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
