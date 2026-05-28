import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BatteryCharging, Wallet, Wrench, Fuel, Route as RouteIcon, Bot,
  Bell, BellRing, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { computeTco } from '../../lib/tco';
import { buildReminders } from '../../lib/reminders';
import { requestNotificationPermission, showNotification, notificationsSupported } from '../../lib/notifications';
import { formatCurrency } from '../../utils/dateUtils';

const FEATURES = [
  { to: '/charging', label: 'Şarj Kayıtları', desc: 'Elektrikli / hibrit', icon: BatteryCharging, color: 'from-green-500 to-emerald-600' },
  { to: '/expenses', label: 'Giderler & TCO', desc: 'HGS, MTV, sigorta…', icon: Wallet, color: 'from-amber-500 to-orange-600' },
  { to: '/service', label: 'Servis Geçmişi', desc: 'Bakım & maliyet', icon: Wrench, color: 'from-blue-500 to-indigo-600' },
  { to: '/prices', label: 'Yakıt Fiyatları', desc: 'Takip & en ucuz', icon: Fuel, color: 'from-rose-500 to-red-600' },
  { to: '/trips', label: 'Sefer Günlüğü', desc: 'İş / özel km', icon: RouteIcon, color: 'from-violet-500 to-purple-600' },
  { to: '/assistant', label: 'AI Asistan', desc: 'Verinle sohbet', icon: Bot, color: 'from-fuchsia-500 to-purple-600' },
];

export const GaragePage: React.FC = () => {
  const { logs, fuelPurchases, chargeSessions, expenses, serviceRecords, maintenanceItems, documents } =
    useAppStore();

  const year = new Date().getFullYear();
  const lastOdo = logs.length ? Math.max(...logs.map((l) => l.currentOdometer)) : 0;

  const tco = useMemo(
    () => computeTco({ year, logs, purchases: fuelPurchases, charges: chargeSessions, expenses, services: serviceRecords }),
    [year, logs, fuelPurchases, chargeSessions, expenses, serviceRecords]
  );
  const reminders = useMemo(
    () => buildReminders({ maintenance: maintenanceItems, documents, currentOdometer: lastOdo }),
    [maintenanceItems, documents, lastOdo]
  );

  const [notifGranted, setNotifGranted] = useState(
    notificationsSupported() && Notification.permission === 'granted'
  );

  const enableNotifications = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      setNotifGranted(true);
      const first = reminders[0];
      showNotification(
        'TripBook hatırlatmaları açık',
        first ? `${first.title}: ${first.detail}` : 'Yaklaşan bir hatırlatma yok.'
      );
      toast.success('Bildirimler etkinleştirildi.');
    } else {
      toast.error('Bildirim izni verilmedi.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Garaj</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Araç maliyeti, hatırlatmalar ve daha fazlası</p>
      </div>

      {/* TCO summary */}
      <Link to="/expenses" className="block bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-90">{year} Toplam Araç Maliyeti</p>
        <p className="text-3xl font-extrabold mt-1">{formatCurrency(tco.total)}</p>
        <p className="text-xs opacity-80 mt-1">Detay için dokun →</p>
      </Link>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4" /> Hatırlatmalar
          </h3>
          {notificationsSupported() && !notifGranted && (
            <button onClick={enableNotifications} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
              <BellRing className="w-3.5 h-3.5" /> Bildirimleri Aç
            </button>
          )}
        </div>
        {reminders.length === 0 ? (
          <p className="text-sm text-gray-400">Yaklaşan bakım/belge yok. 🎉</p>
        ) : (
          <div className="space-y-2">
            {reminders.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${r.severity === 'overdue' ? 'text-red-500' : 'text-amber-500'}`} />
                <span className="flex-1 text-gray-700 dark:text-gray-200 truncate">{r.title}</span>
                <span className={`text-xs font-semibold ${r.severity === 'overdue' ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>{r.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-3">
            <div className={`bg-gradient-to-br ${f.color} p-2.5 rounded-xl shadow shrink-0`}>
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{f.label}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{f.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};
