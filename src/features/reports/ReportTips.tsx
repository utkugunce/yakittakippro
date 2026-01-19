import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, Fuel, DollarSign, Clock, MapPin, ThermometerSun } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface ReportTipsProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

interface Tip {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  type: 'savings' | 'efficiency' | 'habit' | 'info';
  priority: number;
}

export const ReportTips: React.FC<ReportTipsProps> = ({ logs, purchases }) => {
  const tips = useMemo<Tip[]>(() => {
    const result: Tip[] = [];

    if (logs.length < 5) {
      result.push({
        id: 'more-data',
        icon: Lightbulb,
        title: 'Daha Fazla Kayıt Ekleyin',
        description: 'Daha iyi öneriler için en az 10 kayıt ekleyin.',
        type: 'info',
        priority: 1,
      });
      return result;
    }

    // Analyze consumption variance
    const consumptions = logs.map(l => l.avgConsumption).filter(c => c > 0);
    if (consumptions.length >= 5) {
      const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
      const variance = consumptions.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / consumptions.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > 1.5) {
        result.push({
          id: 'inconsistent',
          icon: TrendingDown,
          title: 'Tutarlı Sürüş Önerisi',
          description: 'Tüketiminiz çok değişken. Sabit hızda sürüş yakıt tasarrufu sağlar.',
          type: 'efficiency',
          priority: 2,
        });
      }
    }

    // Analyze fuel purchase timing
    if (purchases.length >= 3) {
      const sortedPurchases = [...purchases].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Check for panic buying (small amounts)
      const smallFills = sortedPurchases.filter(p => p.liters < 20);
      if (smallFills.length > sortedPurchases.length * 0.4) {
        result.push({
          id: 'small-fills',
          icon: Fuel,
          title: 'Tam Depo Önerisi',
          description: 'Sık sık az yakıt alıyorsunuz. Tam depo yapmak zaman ve para tasarrufu sağlar.',
          type: 'savings',
          priority: 3,
        });
      }
    }

    // Best day analysis
    const dayStats: Record<number, { cost: number; count: number }> = {};
    logs.forEach(l => {
      const day = new Date(l.date).getDay();
      if (!dayStats[day]) dayStats[day] = { cost: 0, count: 0 };
      dayStats[day].cost += l.dailyCost;
      dayStats[day].count++;
    });

    const avgByDay = Object.entries(dayStats)
      .map(([day, data]) => ({ day: parseInt(day), avg: data.cost / data.count }))
      .filter(d => d.avg > 0)
      .sort((a, b) => a.avg - b.avg);

    if (avgByDay.length >= 4) {
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      const cheapestDay = dayNames[avgByDay[0].day];
      result.push({
        id: 'best-day',
        icon: Clock,
        title: `${cheapestDay} Günleri Tasarruf`,
        description: `${cheapestDay} günleri ortalama harcamanız daha düşük. Bu günleri tercih edin.`,
        type: 'habit',
        priority: 4,
      });
    }

    // Station analysis
    const stationPrices: Record<string, { total: number; count: number }> = {};
    purchases.forEach(p => {
      if (p.station) {
        if (!stationPrices[p.station]) stationPrices[p.station] = { total: 0, count: 0 };
        stationPrices[p.station].total += p.pricePerLiter;
        stationPrices[p.station].count++;
      }
    });

    const avgPrices = Object.entries(stationPrices)
      .map(([station, data]) => ({ station, avg: data.total / data.count }))
      .filter(s => s.avg > 0)
      .sort((a, b) => a.avg - b.avg);

    if (avgPrices.length >= 2) {
      const cheapest = avgPrices[0];
      const expensive = avgPrices[avgPrices.length - 1];
      const diff = expensive.avg - cheapest.avg;
      
      if (diff > 1) {
        result.push({
          id: 'station-choice',
          icon: MapPin,
          title: `${cheapest.station} Tercih Edin`,
          description: `${cheapest.station} ortalama ₺${diff.toFixed(2)}/L daha ucuz.`,
          type: 'savings',
          priority: 5,
        });
      }
    }

    // Seasonal tip
    const month = new Date().getMonth();
    if (month >= 5 && month <= 7) { // Summer
      result.push({
        id: 'summer-tip',
        icon: ThermometerSun,
        title: 'Yaz Tasarruf İpucu',
        description: 'Sıcak havalarda klima %10-15 daha fazla yakıt tüketir. Pencere açmak şehir içinde daha ekonomik.',
        type: 'efficiency',
        priority: 6,
      });
    } else if (month >= 11 || month <= 1) { // Winter
      result.push({
        id: 'winter-tip',
        icon: ThermometerSun,
        title: 'Kış Tasarruf İpucu',
        description: 'Soğuk havada motor ısınmadan hareket etmek yakıt tüketimini artırır. 30 saniye bekleyin.',
        type: 'efficiency',
        priority: 6,
      });
    }

    return result.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [logs, purchases]);

  if (tips.length === 0) return null;

  const typeStyles = {
    savings: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-500',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    efficiency: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-500',
      text: 'text-blue-800 dark:text-blue-200',
    },
    habit: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-500',
      text: 'text-purple-800 dark:text-purple-200',
    },
    info: {
      bg: 'bg-gray-50 dark:bg-gray-700/50',
      border: 'border-gray-200 dark:border-gray-600',
      iconBg: 'bg-gray-500',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Akıllı Öneriler</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kişiselleştirilmiş tasarruf ipuçları</p>
        </div>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => {
          const styles = typeStyles[tip.type];
          
          return (
            <div
              key={tip.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${styles.bg} ${styles.border}`}
              style={{
                animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className={`p-2 rounded-lg ${styles.iconBg} flex-shrink-0`}>
                <tip.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${styles.text}`}>{tip.title}</p>
                <p className={`text-xs mt-0.5 ${styles.text} opacity-80`}>{tip.description}</p>
              </div>
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
