import React, { useMemo } from 'react';
import { Wrench, AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { MaintenanceItem, VehiclePart } from '../../../types';

interface MaintenanceStatsBarProps {
  items: MaintenanceItem[];
  parts?: VehiclePart[];
  currentOdometer?: number;
}

export const MaintenanceStatsBar: React.FC<MaintenanceStatsBarProps> = ({ items, parts = [], currentOdometer = 0 }) => {
  const stats = useMemo(() => {
    const total = items.length;

    const overdue = items.filter(i => {
      if (i.type === 'date' && i.dueDate) {
        return new Date(i.dueDate) < new Date();
      }
      if ((i.type === 'km' || i.type === 'both') && i.nextDueKm) {
        return i.nextDueKm < currentOdometer;
      }
      return false;
    }).length;

    const upcoming = items.filter(i => {
      if (i.type === 'date' && i.dueDate) {
        const days = Math.ceil((new Date(i.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= (i.notifyBeforeDays || 30);
      }
      if ((i.type === 'km' || i.type === 'both') && i.nextDueKm) {
        const remaining = i.nextDueKm - currentOdometer;
        return remaining >= 0 && remaining <= (i.notifyBeforeKm || 1000);
      }
      return false;
    }).length;

    const ok = total - overdue - upcoming;
    const partsCount = parts.length;

    return { total, overdue, upcoming, ok, partsCount };
  }, [items, parts, currentOdometer]);

  if (stats.total === 0 && stats.partsCount === 0) {
    return null;
  }

  const statItems = [
    {
      icon: Wrench,
      label: 'Toplam Bakım',
      value: stats.total,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20'
    },
    {
      icon: CheckCircle,
      label: 'Durumu İyi',
      value: stats.ok,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20'
    },
    {
      icon: AlertTriangle,
      label: 'Yaklaşan',
      value: stats.upcoming,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20'
    },
    {
      icon: AlertCircle,
      label: 'Geciken',
      value: stats.overdue,
      gradient: 'from-red-500 to-rose-600',
      shadowColor: 'shadow-red-500/20'
    }
  ];

  return (
    <div className="mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat, i) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg ${stat.shadowColor}`}
            style={{
              animation: `slideUp 0.4s ease-out ${i * 0.08}s both`,
              willChange: 'transform, opacity'
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-white/10" />
            <div className="absolute right-4 bottom-2 h-8 w-8 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-2">
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-white/80 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Health Score */}
      {stats.total > 0 && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Bakım Sağlığı</span>
            </div>
            <span className={`text-lg font-bold ${stats.overdue > 0 ? 'text-red-500' : stats.upcoming > 0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
              %{stats.total > 0 ? Math.round((stats.ok / stats.total) * 100) : 100}
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${(stats.ok / Math.max(stats.total, 1)) * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${(stats.upcoming / Math.max(stats.total, 1)) * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                style={{ width: `${(stats.overdue / Math.max(stats.total, 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>İyi: {stats.ok}</span>
            <span>Yaklaşan: {stats.upcoming}</span>
            <span>Geciken: {stats.overdue}</span>
          </div>
        </div>
      )}

      <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};
