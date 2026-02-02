import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GamificationState, UserStats, BadgeConditionType } from '../types';
import { INITIAL_BADGES } from '../utils/badgeRules';

interface GamificationStore extends GamificationState {
    // We can add internal helper methods here if needed, but for now interface matches state
}

const calculateLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
};

export const useGamificationStore = create<GamificationStore>()(
    persist(
        (set, get) => ({
            stats: {
                totalXp: 0,
                level: 1,
                currentStreak: 0,
                lastActivityDate: null,
                longestStreak: 0,
            },
            badges: INITIAL_BADGES,

            addXp: (amount: number) => {
                set((state) => {
                    const newXp = state.stats.totalXp + amount;
                    const newLevel = calculateLevel(newXp);

                    // Check for level up could trigger a toast here or in UI via useEffect on level change

                    return {
                        stats: {
                            ...state.stats,
                            totalXp: newXp,
                            level: newLevel,
                        },
                    };
                });
            },

            unlockBadge: (badgeId: string) => {
                set((state) => {
                    const badgeIndex = state.badges.findIndex((b) => b.id === badgeId);
                    if (badgeIndex === -1) return state;

                    const badge = state.badges[badgeIndex];
                    if (badge.unlockedAt) return state; // Already unlocked

                    const updatedBadges = [...state.badges];
                    updatedBadges[badgeIndex] = {
                        ...badge,
                        unlockedAt: new Date().toISOString(),
                    };

                    return { badges: updatedBadges };
                });
            },

            checkBadges: (triggerType: BadgeConditionType, value: number) => {
                const { badges, unlockBadge } = get();

                badges.forEach((badge) => {
                    if (!badge.unlockedAt && badge.conditionType === triggerType) {
                        if (value >= badge.threshold) {
                            unlockBadge(badge.id);
                        }
                    }
                });
            },

            updateStreak: () => {
                set((state) => {
                    const now = new Date();
                    const lastDateStr = state.stats.lastActivityDate;

                    let newStreak = state.stats.currentStreak;

                    if (lastDateStr) {
                        const lastDate = new Date(lastDateStr);
                        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            // Same day (roughly, logic can be tighter for calendar days), or < 24h? 
                            // Simple logic: if < 48 hours and different calendar day.
                            // Re-calculating using calendar days to be safe
                            const isSameDay = now.getDate() === lastDate.getDate() &&
                                now.getMonth() === lastDate.getMonth() &&
                                now.getFullYear() === lastDate.getFullYear();

                            if (isSameDay) {
                                // Already logged today, do nothing to streak
                                return { stats: { ...state.stats, lastActivityDate: now.toISOString() } };
                            }

                            // Check if yesterday
                            const yesterday = new Date(now);
                            yesterday.setDate(yesterday.getDate() - 1);
                            const isYesterday = yesterday.getDate() === lastDate.getDate() &&
                                yesterday.getMonth() === lastDate.getMonth() &&
                                yesterday.getFullYear() === lastDate.getFullYear();

                            if (isYesterday) {
                                newStreak += 1;
                            } else {
                                // Streak broken
                                newStreak = 1;
                            }
                        } else if (diffDays > 1) {
                            // Missed a day
                            newStreak = 1;
                        }
                    } else {
                        // First time
                        newStreak = 1;
                    }

                    return {
                        stats: {
                            ...state.stats,
                            currentStreak: newStreak,
                            longestStreak: Math.max(state.stats.longestStreak, newStreak),
                            lastActivityDate: now.toISOString(),
                        },
                    };
                });
            },
        }),
        {
            name: 'gamification-storage',
        }
    )
);
