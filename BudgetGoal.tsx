import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog } from './types';
import { Target, Wallet, AlertTriangle, CheckCircle, TrendingUp, Edit2, X, Check } from 'lucide-react';

interface BudgetGoalProps {
    logs: DailyLog[];
}

export const BudgetGoal: React.FC<BudgetGoalProps> = ({ logs }) => {
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    const [tempBudget, setTempBudget] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('monthly_budget');
        if (saved) {
            setMonthlyBudget(parseFloat(saved));
        }
    }, []);

    const saveBudget = () => {
        const value = parseFloat(tempBudget);
        if (value > 0) {
            setMonthlyBudget(value);
            localStorage.setItem('monthly_budget', value.toString());
        }
        setIsEditing(false);
    };

    const thisMonthSpent = useMemo(() => {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return logs
            .filter(log => new Date(log.date) >= thisMonthStart)
            .reduce((sum, log) => sum + log.dailyCost, 0);
    }, [logs]);

    const percentUsed = monthlyBudget > 0 ? (thisMonthSpent / monthlyBudget) * 100 : 0;
    const remaining = monthlyBudget - thisMonthSpent;
    const isOverBudget = remaining < 0;
    const isNearLimit = percentUsed >= 80 && percentUsed < 100;

    const getStatusColor = () => {
        if (isOverBudget) return 'from-red-500 to-red-600';
        if (isNearLimit) return 'from-amber-500 to-amber-600';
        return 'from-green-500 to-green-600';
    };

    const getStatusIcon = () => {
        if (isOverBudget) return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (isNearLimit) return <TrendingUp className="w-5 h-5 text-amber-500" />;
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    };

    if (monthlyBudget === 0 && !isEditing) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Target className="w-6 h-6 text-amber-600" />
                        <div>
                            <h3 className="font-bold text-amber-800 dark:text-amber-300">Bütçe Hedefi Belirle</h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400">Aylık yakıt bütçenizi takip edin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setIsEditing(true); setTempBudget(''); }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm transition-colors"
                    >
                        Belirle
                    </button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Aylık Bütçe
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-500">₺</span>
                    <input
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        placeholder={monthlyBudget > 0 ? monthlyBudget.toString() : '5000'}
                        className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                    />
                    <button
                        onClick={saveBudget}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                    Aylık Bütçe
                </h3>
                <button
                    onClick={() => { setIsEditing(true); setTempBudget(monthlyBudget.toString()); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {/* Progress Bar */}
                <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getStatusColor()} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                    {percentUsed > 100 && (
                        <div className="absolute inset-y-0 right-0 w-1 bg-red-700 animate-pulse" />
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                        {getStatusIcon()}
                        <span className="text-gray-600 dark:text-gray-400">
                            ₺{thisMonthSpent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} / ₺{monthlyBudget.toLocaleString('tr-TR')}
                        </span>
                    </div>
                    <span className={`font-bold ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-green-600'}`}>
                        {isOverBudget
                            ? `₺${Math.abs(remaining).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} aşıldı`
                            : `₺${remaining.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} kaldı`}
                    </span>
                </div>

                {/* Percentage */}
                <div className="text-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{Math.round(percentUsed)}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">kullanıldı</span>
                </div>
            </div>
        </div>
    );
};
