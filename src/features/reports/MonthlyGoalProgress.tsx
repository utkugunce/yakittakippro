import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Flame } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface MonthlyGoalProgressProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
  budgetGoal?: number; // Optional budget from settings
}

export const MonthlyGoalProgress: React.FC<MonthlyGoalProgressProps> = ({ 
  logs, 
  purchases,
  budgetGoal 
}) => {
  const progressData = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    // This month spending
    const thisMonthLogs = logs.filter(l => new Date(l.date) >= thisMonth);
    const thisMonthPurchases = purchases.filter(p => new Date(p.date) >= thisMonth);
    
    const currentSpending = thisMonthLogs.reduce((s, l) => s + l.dailyCost, 0) + 
                            thisMonthPurchases.reduce((s, p) => s + p.totalAmount, 0);

    // Last month for estimate
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthLogs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= lastMonth && d <= lastMonthEnd;
    });
    const lastMonthPurchases = purchases.filter(p => {
      const d = new Date(p.date);
      return d >= lastMonth && d <= lastMonthEnd;
    });
    
    const lastMonthTotal = lastMonthLogs.reduce((s, l) => s + l.dailyCost, 0) + 
                           lastMonthPurchases.reduce((s, p) => s + p.totalAmount, 0);

    // Auto-calculated goal if not provided
    const goal = budgetGoal || Math.max(lastMonthTotal, currentSpending * 1.2);
    
    // Projections
    const dailyAvg = daysPassed > 0 ? currentSpending / daysPassed : 0;
    const projectedTotal = dailyAvg * daysInMonth;
    const remainingBudget = goal - currentSpending;
    const dailyBudget = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
    
    // Progress percentage
    const progressPercent = goal > 0 ? (currentSpending / goal) * 100 : 0;
    const isOnTrack = projectedTotal <= goal;
    const isOverBudget = currentSpending > goal;

    return {
      currentSpending,
      goal,
      progressPercent: Math.min(progressPercent, 100),
      projectedTotal,
      remainingBudget,
      dailyBudget,
      daysRemaining,
      daysPassed,
      daysInMonth,
      isOnTrack,
      isOverBudget,
      lastMonthTotal,
    };
  }, [logs, purchases, budgetGoal]);

  const getStatusColor = () => {
    if (progressData.isOverBudget) return 'from-red-500 to-rose-600';
    if (!progressData.isOnTrack) return 'from-amber-500 to-orange-600';
    return 'from-emerald-500 to-teal-600';
  };

  const getStatusIcon = () => {
    if (progressData.isOverBudget) return AlertCircle;
    if (!progressData.isOnTrack) return Flame;
    return CheckCircle2;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aylık Hedef</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getStatusColor()} text-white text-xs font-medium`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {progressData.isOverBudget ? 'Aşıldı' : progressData.isOnTrack ? 'Yolunda' : 'Risk'}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#progressGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={`${(progressData.progressPercent / 100) * 352} 352`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 1s ease-out',
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={progressData.isOverBudget ? '#ef4444' : '#8b5cf6'} />
                <stop offset="100%" stopColor={progressData.isOverBudget ? '#f43f5e' : '#6366f1'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressData.progressPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">kullanıldı</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Harcanan</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₺{progressData.currentSpending.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Hedef</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                ₺{progressData.goal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Kalan</span>
              <span className={`font-bold ${progressData.remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₺{progressData.remainingBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Budget Suggestion */}
      {progressData.daysRemaining > 0 && progressData.remainingBudget > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Günlük Bütçe Önerisi</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kalan {progressData.daysRemaining} gün için günde{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                ₺{progressData.dailyBudget.toFixed(0)}
              </span>{' '}
              harcayabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {progressData.isOverBudget && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center gap-4 mt-4">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Aylık bütçenizi ₺{Math.abs(progressData.remainingBudget).toFixed(0)} aştınız.
          </p>
        </div>
      )}
    </div>
  );
};
