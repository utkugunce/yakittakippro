import React from 'react';
import { Wrench, AlertTriangle, CheckCircle, Calendar, Award } from 'lucide-react';
import { MaintenanceItem } from '@/types';

interface MaintenanceStatsBarProps {
  items: MaintenanceItem[];
}

export const MaintenanceStatsBar: React.FC<MaintenanceStatsBarProps> = ({ items }) => {
  if (!items.length) return null;

  const total = items.length;
  const overdue = items.filter(i => {
    if (i.type === 'date' && i.dueDate) {
      return new Date(i.dueDate) < new Date();
    }
    if ((i.type === 'km' || i.type === 'both') && i.nextDueKm && i.lastMaintenanceKm !== undefined) {
      return (i.nextDueKm < i.lastMaintenanceKm);
    }
    return false;
  }).length;
  const upcoming = items.filter(i => {
    if (i.type === 'date' && i.dueDate) {
      const days = Math.ceil((new Date(i.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= (i.notifyBeforeDays || 30);
    }
    if ((i.type === 'km' || i.type === 'both') && i.nextDueKm && i.lastMaintenanceKm !== undefined) {
      const remaining = i.nextDueKm - i.lastMaintenanceKm;
      return remaining >= 0 && remaining <= (i.notifyBeforeKm || 1000);
    }
    return false;
  }).length;
  const completed = total - overdue - upcoming;

  const stats = [
    {
      icon: Wrench,
      label: 'Toplam Bakım',
      value: total,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: AlertTriangle,
      label: 'Yaklaşan',
      value: upcoming,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: CheckCircle,
      label: 'Tamamlanan',
      value: completed,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Award,
      label: 'Geciken',
      value: overdue,
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg`}
          style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s both` }}
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-4 h-10 w-10 rounded-full bg-white/5" />
          <div className="relative">
            <div className="inline-flex p-2 rounded-xl bg-white/20 mb-2">
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-white/80 mb-1">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
