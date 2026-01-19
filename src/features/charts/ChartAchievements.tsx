import React, { useMemo } from 'react';
import { Trophy, Flame, Target, Star, Award, Zap, TrendingDown, Calendar } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface ChartAchievementsProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

interface Achievement {
  id: string;
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
  unlocked: boolean;
}

export const ChartAchievements: React.FC<ChartAchievementsProps> = ({ logs, purchases }) => {
  const achievements = useMemo<Achievement[]>(() => {
    if (logs.length === 0) return [];

    // Best efficiency day
    const bestEfficiencyDay = logs.reduce((best, log) => {
      if (log.dailyDistance > 0 && log.dailyFuelConsumed > 0) {
        const efficiency = (log.dailyFuelConsumed / log.dailyDistance) * 100;
        const bestEfficiency = best ? (best.dailyFuelConsumed / best.dailyDistance) * 100 : Infinity;
        return efficiency < bestEfficiency ? log : best;
      }
      return best;
    }, null as DailyLog | null);

    // Longest trip
    const longestTrip = logs.reduce((max, log) => 
      log.dailyDistance > (max?.dailyDistance || 0) ? log : max
    , null as DailyLog | null);

    // Cheapest fuel purchase
    const cheapestPurchase = purchases.reduce((min, p) => 
      p.pricePerLiter < (min?.pricePerLiter || Infinity) ? p : min
    , null as FuelPurchase | null);

    // Streak: consecutive days with entries
    let maxStreak = 0;
    let currentStreak = 0;
    const uniqueDates = logs.map(l => l.date);
    const sortedDates = [...new Set(uniqueDates)].sort() as string[];
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDateStr = sortedDates[i - 1];
        const currDateStr = sortedDates[i];
        const prevDate = new Date(prevDateStr);
        const currDate = new Date(currDateStr);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // Most efficient week
    const weeklyStats: Record<string, { fuel: number; distance: number }> = {};
    logs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyStats[weekKey]) weeklyStats[weekKey] = { fuel: 0, distance: 0 };
      weeklyStats[weekKey].fuel += log.dailyFuelConsumed;
      weeklyStats[weekKey].distance += log.dailyDistance;
    });

    const bestWeek = Object.entries(weeklyStats)
      .filter(([, data]) => data.distance > 0)
      .map(([week, data]) => ({
        week,
        efficiency: (data.fuel / data.distance) * 100
      }))
      .sort((a, b) => a.efficiency - b.efficiency)[0];

    // Total entries milestone
    const totalEntries = logs.length + purchases.length;
    const entryMilestone = totalEntries >= 100 ? 100 : totalEntries >= 50 ? 50 : totalEntries >= 25 ? 25 : totalEntries >= 10 ? 10 : 0;

    return [
      bestEfficiencyDay && {
        id: 'best-efficiency',
        icon: Trophy,
        title: 'En Verimli Gün',
        value: `${((bestEfficiencyDay.dailyFuelConsumed / bestEfficiencyDay.dailyDistance) * 100).toFixed(1)} L/100km`,
        subtitle: new Date(bestEfficiencyDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        gradient: 'from-amber-400 to-yellow-500',
        unlocked: true,
      },
      longestTrip && {
        id: 'longest-trip',
        icon: Target,
        title: 'En Uzun Yolculuk',
        value: `${longestTrip.dailyDistance.toLocaleString()} km`,
        subtitle: new Date(longestTrip.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        gradient: 'from-blue-400 to-cyan-500',
        unlocked: true,
      },
      maxStreak >= 3 && {
        id: 'streak',
        icon: Flame,
        title: 'Kayıt Serisi',
        value: `${maxStreak} Gün`,
        subtitle: 'Üst üste kayıt',
        gradient: 'from-orange-400 to-red-500',
        unlocked: true,
      },
      bestWeek && {
        id: 'best-week',
        icon: Star,
        title: 'En Verimli Hafta',
        value: `${bestWeek.efficiency.toFixed(1)} L/100km`,
        subtitle: new Date(bestWeek.week).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' haftası',
        gradient: 'from-purple-400 to-pink-500',
        unlocked: true,
      },
      cheapestPurchase && {
        id: 'cheapest-fuel',
        icon: TrendingDown,
        title: 'En Ucuz Yakıt',
        value: `₺${cheapestPurchase.pricePerLiter.toFixed(2)}/L`,
        subtitle: `${cheapestPurchase.station} - ${new Date(cheapestPurchase.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`,
        gradient: 'from-emerald-400 to-green-500',
        unlocked: true,
      },
      entryMilestone > 0 && {
        id: 'milestone',
        icon: Award,
        title: 'Kayıt Ustası',
        value: `${entryMilestone}+`,
        subtitle: `${totalEntries} toplam kayıt`,
        gradient: 'from-indigo-400 to-violet-500',
        unlocked: true,
      },
    ].filter(Boolean) as Achievement[];
  }, [logs, purchases]);

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-lg shadow-amber-200 dark:shadow-none">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Başarılar & Rekorlar</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kişisel en iyileriniz</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className="relative group"
            style={{
              animation: `fadeSlideUp 0.4s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className={`
              relative overflow-hidden rounded-xl p-4 
              bg-gradient-to-br ${achievement.gradient}
              transform transition-all duration-300 
              hover:scale-105 hover:shadow-lg
              cursor-default
            `}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <achievement.icon className="w-6 h-6 text-white/90 mb-2" />
              <p className="text-white/80 text-xs font-medium">{achievement.title}</p>
              <p className="text-white text-lg font-bold">{achievement.value}</p>
              <p className="text-white/70 text-[10px] mt-1 truncate">{achievement.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
