import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { MaintenanceItem } from '../../types';
import { useAppStore } from '../../stores/appStore';

interface NotificationSettingsProps {
    maintenanceItems: MaintenanceItem[];
    currentOdometer: number;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ maintenanceItems, currentOdometer }) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    const notificationsEnabled = useAppStore(state => state.notificationsEnabled);
    const setNotificationsEnabled = useAppStore(state => state.setNotificationsEnabled);
    const lastNotificationCheck = useAppStore(state => state.lastNotificationCheck);
    const setLastNotificationCheck = useAppStore(state => state.setLastNotificationCheck);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                setNotificationsEnabled(true);

                // Show test notification
                new Notification('TripBook', {
                    body: 'Bildirimler başarıyla etkinleştirildi! 🚗',
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png'
                });
            }
        }
    };

    const checkMaintenanceAlerts = () => {
        if (permission !== 'granted' || !notificationsEnabled) return;

        const alerts = maintenanceItems.filter(item => {
            if (item.type === 'date' && item.dueDate) {
                const dueDate = new Date(item.dueDate);
                const daysRemaining = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return daysRemaining <= (item.notifyBeforeDays || 30) && daysRemaining >= 0;
            } else if (item.nextDueKm) {
                const remaining = item.nextDueKm - currentOdometer;
                return remaining <= (item.notifyBeforeKm || 1000) && remaining >= 0;
            }
            return false;
        });

        if (alerts.length > 0) {
            const alertText = alerts.map(a => a.title).join(', ');
            new Notification('Bakım Hatırlatması', {
                body: `Yaklaşan bakımlar: ${alertText}`,
                icon: '/pwa-192x192.png',
                tag: 'maintenance-alert'
            });
        }
    };

    const toggleNotifications = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);

        if (newState && permission === 'granted') {
            checkMaintenanceAlerts();
            // Schedule daily check
            scheduleDailyCheck();
        }
    };

    // Schedule daily notification check
    const scheduleDailyCheck = () => {
        // Check if we should run today's check
        const today = new Date().toDateString();

        if (lastNotificationCheck !== today) {
            // Run the check
            checkMaintenanceAlerts();
            setLastNotificationCheck(today);
        }
    };

    // Run scheduled check on mount if enabled
    useEffect(() => {
        if (permission === 'granted' && notificationsEnabled) {
            scheduleDailyCheck();
        }
    }, [permission, notificationsEnabled]);

    if (!('Notification' in window)) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
                <BellOff className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bu tarayıcı bildirimleri desteklemiyor</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Bildirim Ayarları
            </h3>

            <div className="space-y-4">
                {permission === 'default' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                            Bakım hatırlatmalarını almak için bildirimlere izin verin
                        </p>
                        <button
                            onClick={requestPermission}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Bildirimleri Etkinleştir
                        </button>
                    </div>
                )}

                {permission === 'granted' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center">
                                <Check className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">Bildirim izni verildi</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Bakım Hatırlatmaları</span>
                            <button
                                onClick={toggleNotifications}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                title={notificationsEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
                                aria-label={notificationsEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <button
                            onClick={checkMaintenanceAlerts}
                            disabled={!notificationsEnabled}
                            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                            Test Bildirimi Gönder
                        </button>
                    </div>
                )}

                {permission === 'denied' && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="flex items-center text-red-800 dark:text-red-300">
                            <X className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Bildirimler engellendi</span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            Bildirimleri etkinleştirmek için tarayıcı ayarlarından izin verin
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
