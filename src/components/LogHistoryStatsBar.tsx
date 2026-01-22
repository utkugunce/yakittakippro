import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, Flame, Wallet } from 'lucide-react';
import { DailyLog } from '@/types';

interface LogHistoryStatsBarProps {
  logs: DailyLog[];
}

export const LogHistoryStatsBar: React.FC<LogHistoryStatsBarProps> = ({ logs }) => {
  if (!logs.length) return null;

  // Calculate stats
  const totalKm = logs.reduce((sum, l) => sum + l.dailyDistance, 0);
  const longestTrip = logs.reduce((max, l) => l.dailyDistance > max ? l.dailyDistance : max, 0);
  const bestDay = logs.reduce((best, l) => l.avgConsumption < best.avgConsumption ? l : best, logs[0]);
  const totalCost = logs.reduce((sum, l) => sum + l.dailyCost, 0); // Sadece yakıt değil, toplam harcama

  const streak = (() => {
    const dates = Array.from(new Set(logs.map(l => l.date))).sort() as string[];
    let maxStreak = 0, currentStreak = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) currentStreak = 1;
      else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) currentStreak++;
        else currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
    return maxStreak;
  })();

  const stats = [
    {
      icon: Calendar,
      label: 'Toplam Kayıt',
      value: logs.length,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: TrendingUp,
      label: 'Toplam KM',
      value: totalKm.toLocaleString('tr-TR'),
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Wallet,
      label: 'Toplam Harcama',
      value: `₺${totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Award,
      label: 'En Uzun Yol',
      value: `${longestTrip.toLocaleString('tr-TR')} km`,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: TrendingDown,
      label: 'En İyi Gün',
      value: `${bestDay.avgConsumption.toFixed(1)} L/100`,
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: Flame,
      label: 'Kayıt Serisi',
      value: `${streak} gün`,
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg animate-slide-up delay-[${Math.round(i * 80)}ms]`}
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
    </div>
  );
};
