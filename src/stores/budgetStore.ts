import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BudgetState {
    monthlyLimit: number;
    isEnabled: boolean;
    warningThreshold: number; // percentage (e.g., 80 means 80%)

    // Actions
    setMonthlyLimit: (limit: number) => void;
    setEnabled: (enabled: boolean) => void;
    setWarningThreshold: (threshold: number) => void;
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set) => ({
            monthlyLimit: 3000,
            isEnabled: false,
            warningThreshold: 80,

            setMonthlyLimit: (limit) => set({ monthlyLimit: limit }),
            setEnabled: (enabled) => set({ isEnabled: enabled }),
            setWarningThreshold: (threshold) => set({ warningThreshold: threshold })
        }),
        {
            name: 'yakit-budget-store'
        }
    )
);

// Helper to get current month's spending
export const getCurrentMonthSpending = (fuelPurchases: { date: string; totalAmount: number }[]): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return fuelPurchases
        .filter(fp => {
            const date = new Date(fp.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, fp) => sum + fp.totalAmount, 0);
};

// Get remaining days in month
export const getRemainingDays = (): number => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
};
