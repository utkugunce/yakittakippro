import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from './dashboardStore';
import { STORAGE_KEYS, getJSON } from '../lib/storage';

beforeEach(() => {
  localStorage.clear();
  useDashboardStore.setState({ hidden: [] });
});

describe('dashboardStore', () => {
  it('toggles a widget key on and off', () => {
    useDashboardStore.getState().toggle('weekly');
    expect(useDashboardStore.getState().hidden).toContain('weekly');
    useDashboardStore.getState().toggle('weekly');
    expect(useDashboardStore.getState().hidden).not.toContain('weekly');
  });

  it('persists hidden widgets to localStorage', () => {
    useDashboardStore.getState().toggle('eco');
    expect(getJSON<string[]>(STORAGE_KEYS.dashboardHidden, [])).toEqual(['eco']);
  });
});
