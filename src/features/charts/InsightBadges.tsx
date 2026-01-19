import React, { useMemo } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Sparkles, DollarSign, Fuel, Clock } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface InsightBadgesProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

interface Insight {
  id: string;
  icon: React.ElementType;
  message: string;
  type: 'tip' | 'warning' | 'success' | 'info';
}

export const InsightBadges: React.FC<InsightBadgesProps> = ({ logs, purchases }) => {
  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];
    
    if (logs.length < 3) {
      result.push({
        id: 'need-data',
        icon: Sparkles,
        message: 'Daha fazla kayıt ekledikçe daha iyi analizler sunacağız!',
        type: 'info',
      });
      return result;
    }

    // Last 7 days vs previous 7 days consumption
    const now = new Date();
    const last7 = logs.filter(l => {
      const d = new Date(l.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const prev7 = logs.filter(l => {
      const d = new Date(l.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    });

    if (last7.length >= 2 && prev7.length >= 2) {
      const last7Avg = last7.reduce((s, l) => s + l.avgConsumption, 0) / last7.length;
      const prev7Avg = prev7.reduce((s, l) => s + l.avgConsumption, 0) / prev7.length;
      const change = ((last7Avg - prev7Avg) / prev7Avg) * 100;

      if (change < -5) {
        result.push({
          id: 'consumption-improved',
          icon: TrendingDown,
          message: `Tüketiminiz geçen haftaya göre %${Math.abs(change).toFixed(0)} azaldı! 🎉`,
          type: 'success',
        });
      } else if (change > 10) {
        result.push({
          id: 'consumption-increased',
          icon: TrendingUp,
          message: `Tüketiminiz %${change.toFixed(0)} arttı. Lastik basıncını kontrol edin.`,
          type: 'warning',
        });
      }
    }

    // Most expensive day of week
    const dayStats: Record<number, { totalCost: number; count: number }> = {};
    logs.forEach(l => {
      const day = new Date(l.date).getDay();
      if (!dayStats[day]) dayStats[day] = { totalCost: 0, count: 0 };
      dayStats[day].totalCost += l.dailyCost;
      dayStats[day].count++;
    });

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const sortedDays = Object.entries(dayStats)
      .map(([day, data]) => ({ day: parseInt(day), avg: data.totalCost / data.count }))
      .sort((a, b) => b.avg - a.avg);

    if (sortedDays.length >= 3) {
      const cheapestDay = sortedDays[sortedDays.length - 1];
      result.push({
        id: 'cheapest-day',
        icon: DollarSign,
        message: `${dayNames[cheapestDay.day]} günleri en düşük harcama yapıyorsunuz.`,
        type: 'tip',
      });
    }

    // Average fill-up interval
    if (purchases.length >= 3) {
      const sortedPurchases = [...purchases].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let totalDays = 0;
      for (let i = 1; i < sortedPurchases.length; i++) {
        const diff = (new Date(sortedPurchases[i].date).getTime() - 
                     new Date(sortedPurchases[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
        totalDays += diff;
      }
      const avgInterval = totalDays / (sortedPurchases.length - 1);

      if (avgInterval < 5) {
        result.push({
          id: 'frequent-fillup',
          icon: Fuel,
          message: `Ortalama ${avgInterval.toFixed(0)} günde bir yakıt alıyorsunuz. Tam depo yapmayı deneyin.`,
          type: 'tip',
        });
      }
    }

    // Morning vs evening pattern (from log times if available)
    const morningLogs = logs.filter(l => {
      const hour = new Date(l.date).getHours();
      return hour >= 6 && hour < 12;
    });
    const eveningLogs = logs.filter(l => {
      const hour = new Date(l.date).getHours();
      return hour >= 17 && hour < 22;
    });

    if (morningLogs.length > 0 && eveningLogs.length > 0) {
      const morningAvg = morningLogs.reduce((s, l) => s + l.avgConsumption, 0) / morningLogs.length;
      const eveningAvg = eveningLogs.reduce((s, l) => s + l.avgConsumption, 0) / eveningLogs.length;
      
      if (morningAvg < eveningAvg * 0.9) {
        result.push({
          id: 'morning-better',
          icon: Clock,
          message: 'Sabah sürüşlerinde daha az yakıt tüketiyorsunuz.',
          type: 'info',
        });
      }
    }

    // Fuel price trend
    if (purchases.length >= 4) {
      const recentPurchases = [...purchases]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);
      
      const avgRecent = recentPurchases.slice(0, 2).reduce((s, p) => s + p.pricePerLiter, 0) / 2;
      const avgPrev = recentPurchases.slice(2, 4).reduce((s, p) => s + p.pricePerLiter, 0) / 2;
      const priceChange = ((avgRecent - avgPrev) / avgPrev) * 100;

      if (priceChange > 5) {
        result.push({
          id: 'price-up',
          icon: AlertTriangle,
          message: `Yakıt fiyatları %${priceChange.toFixed(0)} arttı. İndirimli günleri takip edin.`,
          type: 'warning',
        });
      } else if (priceChange < -3) {
        result.push({
          id: 'price-down',
          icon: TrendingDown,
          message: `Yakıt fiyatları %${Math.abs(priceChange).toFixed(0)} düştü!`,
          type: 'success',
        });
      }
    }

    return result.slice(0, 4); // Max 4 insights
  }, [logs, purchases]);

  if (insights.length === 0) return null;

  const typeStyles = {
    tip: {
      bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      icon: 'bg-blue-500 text-white',
      text: 'text-blue-800 dark:text-blue-200',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
      icon: 'bg-amber-500 text-white',
      text: 'text-amber-800 dark:text-amber-200',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
      icon: 'bg-emerald-500 text-white',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    info: {
      bg: 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600',
      icon: 'bg-gray-500 text-white',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-yellow-200 dark:shadow-none">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Akıllı İpuçları</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Verilerinize dayalı öneriler</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = typeStyles[insight.type];
          
          return (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg}`}
              style={{
                animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className={`p-2 rounded-lg ${styles.icon} flex-shrink-0`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <p className={`text-sm ${styles.text}`}>{insight.message}</p>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
