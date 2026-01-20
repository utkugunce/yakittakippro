import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamificationState {
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;

    // Actions
    addXP: (amount: number, reason: string) => void;
    updateStreak: () => void;
    resetStreak: () => void;
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,

            addXP: (amount, reason) => {
                console.log(`[Gamification] +${amount} XP: ${reason}`);
                set((state) => ({ totalXP: state.totalXP + amount }));
            },

            updateStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                const state = get();

                if (state.lastActiveDate === today) {
                    // Already active today, no change
                    return;
                }

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (state.lastActiveDate === yesterdayStr) {
                    // Consecutive day - increase streak
                    const newStreak = state.currentStreak + 1;
                    set({
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, state.longestStreak),
                        lastActiveDate: today
                    });
                } else {
                    // Streak broken - start new
                    set({
                        currentStreak: 1,
                        lastActiveDate: today
                    });
                }
            },

            resetStreak: () => set({ currentStreak: 0, lastActiveDate: null })
        }),
        {
            name: 'yakit-takip-gamification'
        }
    )
);
