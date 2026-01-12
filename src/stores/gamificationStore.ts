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
    hasMigrated: boolean;

    // Actions
    addXP: (amount: number, reason: string) => void;
    updateStreak: () => void;
    checkAndUnlockBadges: () => void;
    resetStreak: () => void;
    migrateExistingData: (fuelPurchaseCount: number, logCount: number, activityDates: string[]) => void;
    syncStreaksWithHistory: (dates: string[]) => void;
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
            hasMigrated: false,

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
                            // Check if any fuel-related XP exists
                            shouldUnlock = xpHistory.some(e =>
                                e.reason.includes('Yakıt') || e.reason.includes('yakıt')
                            );
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
                            // Count individual fuel purchases from XP history
                            // Migrated entries say "Geçmiş X yakıt alımı" so extract number
                            let fuelCount = 0;
                            xpHistory.forEach(e => {
                                if (e.reason.includes('Yakıt alımı kaydedildi')) {
                                    fuelCount += 1;
                                } else if (e.reason.includes('Geçmiş') && e.reason.includes('yakıt alımı')) {
                                    const match = e.reason.match(/Geçmiş (\d+) yakıt alımı/);
                                    if (match) fuelCount += parseInt(match[1]);
                                }
                            });
                            shouldUnlock = fuelCount >= 10;
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

            resetStreak: () => set({ currentStreak: 0 }),

            // Migration function for existing data
            migrateExistingData: (fuelPurchaseCount: number, logCount: number, activityDates: string[]) => {
                const { hasMigrated } = get();
                if (hasMigrated) return; // Already migrated

                // Award XP for existing fuel purchases (150 XP each)
                const fuelXP = fuelPurchaseCount * 150;

                // Award XP for existing daily logs (50 XP each)
                const logXP = logCount * 50;

                const totalMigrationXP = fuelXP + logXP;

                // Create migration events
                const events: XPEvent[] = [];

                if (fuelPurchaseCount > 0) {
                    events.push({
                        amount: fuelXP,
                        reason: `Geçmiş ${fuelPurchaseCount} yakıt alımı`,
                        timestamp: new Date().toISOString()
                    });
                }

                if (logCount > 0) {
                    events.push({
                        amount: logXP,
                        reason: `Geçmiş ${logCount} günlük kayıt`,
                        timestamp: new Date().toISOString()
                    });
                }

                set((state) => ({
                    totalXP: state.totalXP + totalMigrationXP,
                    xpHistory: [...events, ...state.xpHistory].slice(0, 50),
                    hasMigrated: true
                }));

                // Also sync streaks
                get().syncStreaksWithHistory(activityDates);
            },

            // Recalculate streaks based on all historical activity
            syncStreaksWithHistory: (dates: string[]) => {
                if (dates.length === 0) {
                    set({ currentStreak: 0, longestStreak: 0 });
                    return;
                }

                // 1. Unique and Sort Dates
                const uniqueDates = Array.from(new Set(dates.map(d => d.split('T')[0]))).sort();

                if (uniqueDates.length === 0) return;

                const today = new Date().toISOString().split('T')[0];
                const yesterdayDate = new Date();
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                const yesterday = yesterdayDate.toISOString().split('T')[0];

                let currentStreak = 0;
                let longestStreak = 0;
                let tempStreak = 0;

                // 2. Calculate Longest Streak
                for (let i = 0; i < uniqueDates.length; i++) {
                    if (i === 0) {
                        tempStreak = 1;
                    } else {
                        const date1 = new Date(uniqueDates[i - 1]);
                        const date2 = new Date(uniqueDates[i]);
                        const diffTime = Math.abs(date2.getTime() - date1.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            tempStreak++;
                        } else {
                            // Streak broken
                            tempStreak = 1;
                        }
                    }
                    if (tempStreak > longestStreak) longestStreak = tempStreak;
                }

                // 3. Calculate Current Streak
                // Check if last activity was today or yesterday
                const lastActivity = uniqueDates[uniqueDates.length - 1];

                if (lastActivity === today || lastActivity === yesterday) {
                    currentStreak = 1;
                    // Go backwards from the last date
                    for (let i = uniqueDates.length - 1; i > 0; i--) {
                        const dateCurrent = new Date(uniqueDates[i]);
                        const datePrev = new Date(uniqueDates[i - 1]);
                        const diffTime = Math.abs(dateCurrent.getTime() - datePrev.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                } else {
                    currentStreak = 0;
                }

                set({
                    currentStreak,
                    longestStreak,
                    lastActivityDate: lastActivity
                });

                // Re-check badges with new streaks
                get().checkAndUnlockBadges();
            }
        }),
        {
            name: 'yakit-gamification-store'
        }
    )
);

// Export all badges for display
export const getAllBadges = () => ALL_BADGES;
