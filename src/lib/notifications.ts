/**
 * Thin wrapper around the Web Notifications API for reminder alerts. Falls back
 * gracefully where notifications are unavailable (e.g. iOS web, SSR).
 */

export const notificationsSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showNotification(title: string, body?: string): boolean {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body, icon: '/pwa-192x192.png' });
    return true;
  } catch {
    return false;
  }
}
