import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, Calendar, Navigation, CheckCircle2 } from 'lucide-react';
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

        const safeItems = maintenanceItems || [];
        const alerts = safeItems.filter(item => {
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
            scheduleDailyCheck();
        }
    };

    const scheduleDailyCheck = () => {
        const today = new Date().toDateString();
        if (lastNotificationCheck !== today) {
            checkMaintenanceAlerts();
            setLastNotificationCheck(today);
        }
    };

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Bildirimler</h3>
                </div>
                {permission === 'granted' && (
                    <button
                        onClick={toggleNotifications}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${notificationsEnabled ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                )}
            </div>

            <div className="p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10">
                    Bakım hatırlatıcıları ve yaklaşan ödemeler için bildirim durumunu buradan yönetebilirsiniz.
                </p>

                {permission === 'default' && (
                    <button
                        onClick={requestPermission}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center shadow-lg shadow-amber-600/20"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        Bildirimleri Etkinleştir
                    </button>
                )}

                {permission === 'denied' && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-300">Bildirimler engellendi. Tarayıcı ayarlarından izin verin.</span>
                    </div>
                )}

                {permission === 'granted' && (
                    <div className="space-y-3">
                        <div className={`p-3 rounded-xl border transition-all ${notificationsEnabled
                            ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
                            : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 opacity-60'
                            }`}>
                            <div className="flex items-center gap-3">
                                <Calendar className={`w-4 h-4 ${notificationsEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {(maintenanceItems || []).filter(i => i.type === 'date' || i.type === 'both').length} Tarih Bazlı Hatırlatıcı
                                </span>
                            </div>
                        </div>

                        <div className={`p-3 rounded-xl border transition-all ${notificationsEnabled
                            ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30'
                            : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 opacity-60'
                            }`}>
                            <div className="flex items-center gap-3">
                                <Navigation className={`w-4 h-4 ${notificationsEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {(maintenanceItems || []).filter(i => i.type === 'km' || i.type === 'both').length} KM Bazlı Hatırlatıcı
                                </span>
                            </div>
                        </div>

                        {notificationsEnabled && (
                            <button
                                onClick={checkMaintenanceAlerts}
                                className="w-full mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                            >
                                Test Bildirimi Gönder
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
