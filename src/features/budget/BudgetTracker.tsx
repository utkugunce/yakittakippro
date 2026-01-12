import React, { useState, useMemo } from 'react';
import { Wallet, Target, AlertTriangle, TrendingUp, Settings, Check, X } from 'lucide-react';
import { useBudgetStore, getCurrentMonthSpending, getRemainingDays } from '../../stores/budgetStore';

interface BudgetTrackerProps {
    fuelPurchases: { date: string; totalAmount: number }[];
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ fuelPurchases }) => {
    const { monthlyLimit, isEnabled, warningThreshold, setMonthlyLimit, setEnabled, setWarningThreshold } = useBudgetStore();
    const [showSettings, setShowSettings] = useState(false);
    const [tempLimit, setTempLimit] = useState(monthlyLimit.toString());
    const [tempThreshold, setTempThreshold] = useState(warningThreshold.toString());

    const currentSpending = useMemo(() => getCurrentMonthSpending(fuelPurchases), [fuelPurchases]);
    const remainingDays = getRemainingDays();
    const percentage = monthlyLimit > 0 ? (currentSpending / monthlyLimit) * 100 : 0;
    const remaining = monthlyLimit - currentSpending;
    const dailyBudget = remainingDays > 0 ? remaining / remainingDays : 0;

    const isWarning = percentage >= warningThreshold;
    const isOver = percentage >= 100;

    const handleSaveSettings = () => {
        const limit = parseFloat(tempLimit);
        const threshold = parseFloat(tempThreshold);
        if (!isNaN(limit) && limit > 0) setMonthlyLimit(limit);
        if (!isNaN(threshold) && threshold > 0 && threshold <= 100) setWarningThreshold(threshold);
        setShowSettings(false);
    };

    const monthName = new Date().toLocaleDateString('tr-TR', { month: 'long' });

    if (!isEnabled) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Target className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Aylık Bütçe</h3>
                            <p className="text-xs text-gray-500">Harcama limiti belirle</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEnabled(true)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Aktifleştir
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl p-4 border shadow-sm transition-colors ${isOver
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : isWarning
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isOver ? 'bg-red-100 dark:bg-red-900/40' : isWarning ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-primary-100 dark:bg-primary-900/40'
                        }`}>
                        {isOver ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                            <Wallet className={`w-5 h-5 ${isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-primary-600 dark:text-primary-400'}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{monthName} Bütçesi</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {remainingDays} gün kaldı
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <Settings className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Aylık Limit (₺)
                        </label>
                        <input
                            type="number"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Uyarı Eşiği (%)
                        </label>
                        <input
                            type="number"
                            value={tempThreshold}
                            onChange={(e) => setTempThreshold(e.target.value)}
                            min="1"
                            max="100"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSaveSettings}
                            className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center justify-center space-x-1"
                        >
                            <Check className="w-4 h-4" />
                            <span>Kaydet</span>
                        </button>
                        <button
                            onClick={() => setEnabled(false)}
                            className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-800 dark:text-white">
                        ₺{currentSpending.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        / ₺{monthlyLimit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : isWarning
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                    : 'bg-gradient-to-r from-primary-500 to-primary-600'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span className={`font-medium ${isOver ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'}`}>
                        %{percentage.toFixed(0)} kullanıldı
                    </span>
                    {!isOver && (
                        <span className="text-gray-500 dark:text-gray-400">
                            ₺{remaining.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} kaldı
                        </span>
                    )}
                </div>
            </div>

            {/* Daily Budget Suggestion */}
            {!isOver && remainingDays > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-primary-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                        Günlük bütçe: <strong>₺{dailyBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</strong>
                    </span>
                </div>
            )}

            {/* Warning Message */}
            {isOver && (
                <div className="flex items-center space-x-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                        Bütçe aşıldı! ₺{Math.abs(remaining).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} fazla harcandı.
                    </span>
                </div>
            )}

            {isWarning && !isOver && (
                <div className="flex items-center space-x-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Dikkat! Bütçenin %{warningThreshold}'ine ulaştın.
                    </span>
                </div>
            )}
        </div>
    );
};

export default BudgetTracker;
