import React, { useMemo } from 'react';
import { Award, TrendingUp, Zap, Fuel, LineChart, Shield } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface DrivingScoreProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

export const DrivingScore: React.FC<DrivingScoreProps> = ({ logs, purchases }) => {
  const scoreData = useMemo(() => {
    if (logs.length < 5) return null;

    // Calculate various metrics
    const last30Days = logs.filter(l => {
      const d = new Date(l.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    });

    if (last30Days.length < 3) return null;

    // 1. Efficiency Score (lower consumption = higher score) - Reference 8.0L
    const avgConsumption = last30Days.reduce((s, l) => s + l.avgConsumption, 0) / last30Days.length;
    const efficiencyScore = Math.max(0, Math.min(100, 100 - (avgConsumption - 8) * 10));

    // 2. Consistency Score (less variance = higher score)
    const consumptions = last30Days.map(l => l.avgConsumption);
    const mean = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const variance = consumptions.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / consumptions.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev * 20));

    // 3. Progress Score (replacing Target) - Improvement trend
    // Compares first half of the entries vs second half
    const sortedLogs = [...last30Days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midPoint = Math.ceil(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, midPoint);
    const secondHalf = sortedLogs.slice(midPoint);

    let progressScore = 75; // Neutral start
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((s, l) => s + l.avgConsumption, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, l) => s + l.avgConsumption, 0) / secondHalf.length;

      if (secondAvg < firstAvg) {
        // Improvement: Add points based on % reduction
        const improvement = ((firstAvg - secondAvg) / firstAvg) * 100;
        progressScore = Math.min(100, 75 + improvement * 2);
      } else {
        // Deterioration: Subtract points
        const deterioration = ((secondAvg - firstAvg) / firstAvg) * 100;
        progressScore = Math.max(0, 75 - deterioration * 2);
      }
    }

    // 4. Cost Awareness (using cheaper stations = higher score)
    const recentPurchases = purchases.filter(p => {
      const d = new Date(p.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    });

    let costScore = 70; // Default
    if (recentPurchases.length >= 2) {
      const avgPrice = recentPurchases.reduce((s, p) => s + p.pricePerLiter, 0) / recentPurchases.length;
      const allPrices = purchases.map(p => p.pricePerLiter);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      if (maxPrice > minPrice) {
        costScore = 100 - ((avgPrice - minPrice) / (maxPrice - minPrice)) * 50;
      }
    }

    // Overall Score (weighted average)
    const overallScore = Math.round(
      efficiencyScore * 0.35 +
      consistencyScore * 0.25 +
      progressScore * 0.20 +
      costScore * 0.20
    );

    const getGrade = (score: number) => {
      if (score >= 90) return { grade: 'A+', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if (score >= 80) return { grade: 'A', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if (score >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-500' };
      if (score >= 60) return { grade: 'C', color: 'text-amber-500', bg: 'bg-amber-500' };
      return { grade: 'D', color: 'text-red-500', bg: 'bg-red-500' };
    };

    return {
      overall: overallScore,
      efficiency: Math.round(efficiencyScore),
      consistency: Math.round(consistencyScore),
      progress: Math.round(progressScore),
      costAwareness: Math.round(costScore),
      grade: getGrade(overallScore),
    };
  }, [logs, purchases]);

  if (!scoreData) return null;

  const metrics = [
    { label: 'Verimlilik', value: scoreData.efficiency, icon: Fuel, color: 'text-emerald-500' },
    { label: 'Tutarlılık', value: scoreData.consistency, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Gelişim', value: scoreData.progress, icon: LineChart, color: 'text-purple-500' },
    { label: 'Tasarruf', value: scoreData.costAwareness, icon: Shield, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sürüş Performans Puanı</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Son 30 günlük analiz</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {/* Circular Score */}
        <div className="relative">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${(scoreData.overall / 100) * 302} 302`}
              strokeLinecap="round"
              className={scoreData.grade.color}
              style={{
                transition: 'stroke-dasharray 1s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreData.grade.color}`}>
              {scoreData.grade.grade}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{scoreData.overall}/100</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{metric.value}</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${metric.color.replace('text-', 'bg-')}`}
                    style={{
                      width: `${metric.value}%`,
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {scoreData.overall >= 80 && '🎉 Harika! Verimli bir sürücüsünüz. Yakıt tasarrufunuz ortalamanın üzerinde.'}
          {scoreData.overall >= 60 && scoreData.overall < 80 && '👍 İyi gidiyorsunuz! Birkaç iyileştirme ile A seviyesine çıkabilirsiniz.'}
          {scoreData.overall < 60 && '💡 Gelişim alanı var. Sabit hızda sürüş ve lastik basıncı kontrolü deneyin.'}
        </p>
      </div>
    </div>
  );
};
