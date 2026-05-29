import { create } from 'zustand';
import { STORAGE_KEYS, getJSON, setJSON } from '../lib/storage';

interface DashboardState {
  /** Widget keys the user has chosen to hide. */
  hidden: string[];
  toggle: (key: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  hidden: getJSON<string[]>(STORAGE_KEYS.dashboardHidden, []),
  toggle: (key) =>
    set((s) => {
      const hidden = s.hidden.includes(key)
        ? s.hidden.filter((k) => k !== key)
        : [...s.hidden, key];
      setJSON(STORAGE_KEYS.dashboardHidden, hidden);
      return { hidden };
    }),
}));
