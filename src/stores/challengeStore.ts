import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'spending' | 'streak' | 'entries' | 'savings';
    target: number;
    current: number;
    xpReward: number;
    isCompleted: boolean;
    completedAt?: string;
    expiresAt: string;
}

interface ChallengeState {
    activeChallenges: Challenge[];
    completedChallenges: Challenge[];
    lastRefresh: string | null;

    // Actions
    refreshChallenges: () => void;
    updateProgress: (type: Challenge['type'], value: number) => void;
    completeChallenge: (id: string) => void;
}

// Generate weekly challenges
const generateWeeklyChallenges = (): Challenge[] => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    const expiresAt = endOfWeek.toISOString();

    const challengeTemplates = [
        {
            id: 'streak_3',
            title: 'Düzenli Takipçi',
            description: '3 gün üst üste kayıt gir',
            icon: '🔥',
            type: 'streak' as const,
            target: 3,
            xpReward: 200
        },
        {
            id: 'entries_5',
            title: 'Aktif Sürücü',
            description: 'Bu hafta 5 kayıt ekle',
            icon: '📝',
            type: 'entries' as const,
            target: 5,
            xpReward: 150
        },
        {
            id: 'spending_limit',
            title: 'Tasarrufçu',
            description: 'Bu hafta 500 TL altında harca',
            icon: '💰',
            type: 'savings' as const,
            target: 500,
            xpReward: 250
        }
    ];

    // Randomly select 2-3 challenges
    const shuffled = challengeTemplates.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2 + Math.floor(Math.random() * 2));

    return selected.map(template => ({
        ...template,
        id: `${template.id}_${Date.now()}`,
        current: 0,
        isCompleted: false,
        expiresAt
    }));
};

// Check if challenges need refresh (weekly)
const needsRefresh = (lastRefresh: string | null): boolean => {
    if (!lastRefresh) return true;

    const last = new Date(lastRefresh);
    const now = new Date();

    // Check if we're in a new week (Sunday as start)
    const lastWeek = Math.floor(last.getTime() / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));

    return currentWeek > lastWeek;
};

export const useChallengeStore = create<ChallengeState>()(
    persist(
        (set, get) => ({
            activeChallenges: [],
            completedChallenges: [],
            lastRefresh: null,

            refreshChallenges: () => {
                const { lastRefresh, activeChallenges, completedChallenges } = get();

                if (needsRefresh(lastRefresh) || activeChallenges.length === 0) {
                    // Move uncompleted to history
                    const expired = activeChallenges.filter(c => !c.isCompleted);

                    set({
                        activeChallenges: generateWeeklyChallenges(),
                        completedChallenges: [...completedChallenges, ...expired].slice(-20),
                        lastRefresh: new Date().toISOString()
                    });
                }
            },

            updateProgress: (type, value) => {
                set((state) => ({
                    activeChallenges: state.activeChallenges.map(challenge => {
                        if (challenge.type === type && !challenge.isCompleted) {
                            const newCurrent = type === 'savings'
                                ? value // For savings, lower is better
                                : challenge.current + value;

                            const isNowCompleted = type === 'savings'
                                ? newCurrent <= challenge.target
                                : newCurrent >= challenge.target;

                            return {
                                ...challenge,
                                current: newCurrent,
                                isCompleted: isNowCompleted,
                                completedAt: isNowCompleted ? new Date().toISOString() : undefined
                            };
                        }
                        return challenge;
                    })
                }));
            },

            completeChallenge: (id) => {
                set((state) => ({
                    activeChallenges: state.activeChallenges.map(c =>
                        c.id === id ? { ...c, isCompleted: true, completedAt: new Date().toISOString() } : c
                    )
                }));
            }
        }),
        {
            name: 'yakit-challenge-store'
        }
    )
);
