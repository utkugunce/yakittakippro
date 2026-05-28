import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from './toastStore';

beforeEach(() => {
  useToastStore.getState().clear();
  vi.useRealTimers();
});

describe('toastStore', () => {
  it('adds a toast and returns its id', () => {
    const id = toast.error('boom');
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ id, type: 'error', message: 'boom' });
  });

  it('dismisses a toast by id', () => {
    const id = toast.success('ok');
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('auto-dismisses after the given duration', () => {
    vi.useFakeTimers();
    useToastStore.getState().show('info', 'temp', 1000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('keeps sticky toasts when duration is non-positive', () => {
    vi.useFakeTimers();
    useToastStore.getState().show('info', 'sticky', 0);
    vi.advanceTimersByTime(10000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
