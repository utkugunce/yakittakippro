import React, { useEffect } from 'react';
import { Target, Trophy, Clock, Star, CheckCircle, Zap } from 'lucide-react';
import { useChallengeStore, Challenge } from '../../stores/challengeStore';
import { useGamificationStore } from '../../stores/gamificationStore';

export const WeeklyChallenges: React.FC = () => {
    const { activeChallenges, refreshChallenges } = useChallengeStore();
    const { addXP } = useGamificationStore();

    // Refresh challenges on mount
    useEffect(() => {
        refreshChallenges();
    }, [refreshChallenges]);

    // Award XP when challenge completes
    useEffect(() => {
        activeChallenges.forEach(challenge => {
            if (challenge.isCompleted && challenge.completedAt) {
                // Check if XP was already awarded (within last second)
                const completedTime = new Date(challenge.completedAt).getTime();
                const now = Date.now();
                if (now - completedTime < 1000) {
                    addXP(challenge.xpReward, `Meydan okuma: ${challenge.title}`);
                }
            }
        });
    }, [activeChallenges, addXP]);

    const getTimeRemaining = () => {
        if (activeChallenges.length === 0) return '';
        const expires = new Date(activeChallenges[0].expiresAt);
        const now = new Date();
        const diff = expires.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} gün ${hours} saat`;
        return `${hours} saat`;
    };

    const completedCount = activeChallenges.filter(c => c.isCompleted).length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">Haftalık Meydan Okumalar</h3>
                            <p className="text-xs text-white/70">
                                {completedCount}/{activeChallenges.length} tamamlandı
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining()}</span>
                    </div>
                </div>
            </div>

            {/* Challenges */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {activeChallenges.map(challenge => (
                    <ChallengeItem key={challenge.id} challenge={challenge} />
                ))}

                {activeChallenges.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Yeni meydan okumalar yükleniyor...</p>
                    </div>
                )}
            </div>

            {/* Total XP */}
            {activeChallenges.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                            Toplam: <strong className="text-purple-600 dark:text-purple-400">
                                +{activeChallenges.reduce((sum, c) => sum + c.xpReward, 0)} XP
                            </strong>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ChallengeItem: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
    const progress = challenge.type === 'savings'
        ? Math.max(0, 100 - (challenge.current / challenge.target) * 100)
        : Math.min(100, (challenge.current / challenge.target) * 100);

    return (
        <div className={`p-4 transition-colors ${challenge.isCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
            <div className="flex items-start space-x-3">
                <div className={`text-2xl ${challenge.isCompleted ? 'grayscale-0' : 'grayscale-0'}`}>
                    {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold text-sm ${challenge.isCompleted
                                ? 'text-green-700 dark:text-green-400'
                                : 'text-gray-800 dark:text-white'
                            }`}>
                            {challenge.title}
                            {challenge.isCompleted && (
                                <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                            )}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className={challenge.isCompleted ? 'text-green-600' : 'text-gray-500'}>
                                +{challenge.xpReward} XP
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {challenge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${challenge.isCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                        <span>
                            {challenge.type === 'savings'
                                ? `₺${challenge.current.toLocaleString('tr-TR')} harcandı`
                                : `${challenge.current}/${challenge.target}`
                            }
                        </span>
                        {challenge.isCompleted && (
                            <span className="text-green-600 font-medium">Tamamlandı! 🎉</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyChallenges;
