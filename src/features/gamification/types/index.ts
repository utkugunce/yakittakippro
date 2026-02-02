export interface UserStats {
  totalXp: number;
  level: number;
  currentStreak: number;
  lastActivityDate: string | null; // ISO Date string
  longestStreak: number;
}

export type BadgeConditionType = 'LOG_COUNT' | 'STREAK_DAYS' | 'TOTAL_LITERS' | 'FIRST_LOG';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // We will map this string to Lucide icons in the UI component
  conditionType: BadgeConditionType;
  threshold: number;
  unlockedAt?: string; // ISO date string if unlocked
}

export interface GamificationState {
  stats: UserStats;
  badges: Badge[];
  
  // Actions
  addXp: (amount: number) => void;
  checkBadges: (triggerType: BadgeConditionType, value: number) => void;
  updateStreak: () => void;
  unlockBadge: (badgeId: string) => void;
}
