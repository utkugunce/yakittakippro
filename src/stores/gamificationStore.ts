import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: string;
    unlockedAt?: string;
}

export interface XPEvent {
    amount: number;
    reason: string;
    timestamp: string;
}

interface GamificationState {
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    badges: Badge[];
    xpHistory: XPEvent[];

    // Actions
    addXP: (amount: number, reason: string) => void;
    updateStreak: () => void;
    checkAndUnlockBadges: () => void;
    resetStreak: () => void;
}

// Predefined badges
const ALL_BADGES: Badge[] = [
    {
        id: 'first_fuel',
        name: 'İlk Adım',
        description: 'İlk yakıt alımını kaydet',
        icon: '⛽',
        requirement: 'firstFuel'
    },
    {
        id: 'streak_3',
        name: 'Düzenli Sürücü',
        description: '3 gün üst üste kayıt tut',
        icon: '🔥',
        requirement: 'streak3'
    },
    {
        id: 'streak_7',
        name: 'Haftalık Şampiyon',
        description: '7 gün üst üste kayıt tut',
        icon: '🏆',
        requirement: 'streak7'
    },
    {
        id: 'streak_30',
        name: 'Aylık Efsane',
        description: '30 gün üst üste kayıt tut',
        icon: '👑',
        requirement: 'streak30'
    },
    {
        id: 'xp_500',
        name: 'Çaylak',
        description: '500 XP kazan',
        icon: '🌱',
        requirement: 'xp500'
    },
    {
        id: 'xp_1000',
        name: 'Deneyimli',
        description: '1000 XP kazan',
        icon: '⭐',
        requirement: 'xp1000'
    },
    {
        id: 'xp_5000',
        name: 'Uzman',
        description: '5000 XP kazan',
        icon: '💎',
        requirement: 'xp5000'
    },
    {
        id: 'fuel_10',
        name: 'Yakıt Uzmanı',
        description: '10 yakıt alımı kaydet',
        icon: '🚗',
        requirement: 'fuel10'
    }
];

const isSameDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
};

const isYesterday = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const yesterday = new Date(d2);
    yesterday.setDate(yesterday.getDate() - 1);
    return d1.toDateString() === yesterday.toDateString();
};

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            badges: [],
            xpHistory: [],

            addXP: (amount, reason) => {
                const event: XPEvent = {
                    amount,
                    reason,
                    timestamp: new Date().toISOString()
                };

                set((state) => ({
                    totalXP: state.totalXP + amount,
                    xpHistory: [event, ...state.xpHistory].slice(0, 50) // Keep last 50
                }));

                // Check for badge unlocks after XP update
                get().checkAndUnlockBadges();
            },

            updateStreak: () => {
                const today = new Date().toISOString();
                const { lastActivityDate, currentStreak, longestStreak } = get();

                if (!lastActivityDate) {
                    // First activity
                    set({
                        currentStreak: 1,
                        longestStreak: Math.max(1, longestStreak),
                        lastActivityDate: today
                    });
                } else if (isSameDay(lastActivityDate, today)) {
                    // Already logged today, no change
                    return;
                } else if (isYesterday(lastActivityDate, today)) {
                    // Consecutive day
                    const newStreak = currentStreak + 1;
                    set({
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, longestStreak),
                        lastActivityDate: today
                    });
                } else {
                    // Streak broken
                    set({
                        currentStreak: 1,
                        lastActivityDate: today
                    });
                }

                get().checkAndUnlockBadges();
            },

            checkAndUnlockBadges: () => {
                const { totalXP, currentStreak, badges, xpHistory } = get();
                const unlockedIds = new Set(badges.map(b => b.id));
                const newBadges: Badge[] = [];

                // Check each badge
                ALL_BADGES.forEach(badge => {
                    if (unlockedIds.has(badge.id)) return;

                    let shouldUnlock = false;
                    switch (badge.requirement) {
                        case 'firstFuel':
                            shouldUnlock = xpHistory.some(e => e.reason.includes('Yakıt'));
                            break;
                        case 'streak3':
                            shouldUnlock = currentStreak >= 3;
                            break;
                        case 'streak7':
                            shouldUnlock = currentStreak >= 7;
                            break;
                        case 'streak30':
                            shouldUnlock = currentStreak >= 30;
                            break;
                        case 'xp500':
                            shouldUnlock = totalXP >= 500;
                            break;
                        case 'xp1000':
                            shouldUnlock = totalXP >= 1000;
                            break;
                        case 'xp5000':
                            shouldUnlock = totalXP >= 5000;
                            break;
                        case 'fuel10':
                            shouldUnlock = xpHistory.filter(e => e.reason.includes('Yakıt')).length >= 10;
                            break;
                    }

                    if (shouldUnlock) {
                        newBadges.push({
                            ...badge,
                            unlockedAt: new Date().toISOString()
                        });
                    }
                });

                if (newBadges.length > 0) {
                    set((state) => ({ badges: [...state.badges, ...newBadges] }));
                }
            },

            resetStreak: () => set({ currentStreak: 0 })
        }),
        {
            name: 'yakit-gamification-store'
        }
    )
);

// Export all badges for display
export const getAllBadges = () => ALL_BADGES;
