import React, { useEffect, useState, useMemo } from 'react';
import { DailyLog } from './types';
import { CheckCircle, TrendingUp, TrendingDown, Minus, Route, Fuel, Wallet, X, Sparkles } from 'lucide-react';
import { hapticSuccess } from './src/lib/haptic';

interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    logs: DailyLog[];
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, onClose, logs }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            hapticSuccess();
        }
    }, [isOpen]);

    const stats = useMemo(() => {
        if (logs.length === 0) return null;

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const last30DaysLogs = logs.filter(l => new Date(l.date) >= thirtyDaysAgo);
        const prev30DaysStart = new Date(thirtyDaysAgo);
        prev30DaysStart.setDate(thirtyDaysAgo.getDate() - 30);
        const prev30DaysLogs = logs.filter(l => {
            const d = new Date(l.date);
            return d >= prev30DaysStart && d < thirtyDaysAgo;
        });

        const currentConsumption = last30DaysLogs.length > 0
            ? last30DaysLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / last30DaysLogs.length
            : 0;
        const prevConsumption = prev30DaysLogs.length > 0
            ? prev30DaysLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / prev30DaysLogs.length
            : 0;
        const consumptionChange = prevConsumption > 0
            ? ((currentConsumption - prevConsumption) / prevConsumption) * 100
            : 0;

        const currentDistance = last30DaysLogs.reduce((sum, l) => sum + l.dailyDistance, 0);
        const prevDistance = prev30DaysLogs.reduce((sum, l) => sum + l.dailyDistance, 0);
        const distanceChange = prevDistance > 0
            ? ((currentDistance - prevDistance) / prevDistance) * 100
            : 0;

        // Since Last Fuel-up
        const lastFuelDay = [...logs].reverse().find(l => l.isRefuelDay);
        const lastFuelIndex = lastFuelDay ? logs.indexOf(lastFuelDay) : -1;
        const sinceFuelLogs = lastFuelIndex >= 0 ? logs.slice(0, lastFuelIndex) : [];
        const sinceFuelDistance = sinceFuelLogs.reduce((sum, l) => sum + l.dailyDistance, 0);

        const currentCost = last30DaysLogs.reduce((sum, l) => sum + l.dailyCost, 0);
        const prevCost = prev30DaysLogs.reduce((sum, l) => sum + l.dailyCost, 0);
        const costChange = prevCost > 0
            ? ((currentCost - prevCost) / prevCost) * 100
            : 0;

        return {
            consumption: currentConsumption,
            consumptionChange,
            distance: currentDistance,
            distanceChange,
            sinceFuelDistance,
            cost: currentCost,
            costChange
        };
    }, [logs]);

    if (!isOpen || !stats) return null;

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    const changeIcon = (change: number) => {
        if (Math.abs(change) < 1) return <Minus className="w-3 h-3" />;
        return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    };

    const changeColor = (change: number, isPositiveBetter: boolean = false) => {
        if (Math.abs(change) < 1) return 'text-gray-500';
        if (isPositiveBetter) {
            return change > 0 ? 'text-green-500' : 'text-red-500';
        }
        return change > 0 ? 'text-red-500' : 'text-green-500';
    };

    return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity ${show ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="pt-8 pb-4 text-center">
                    <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-3">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Harika! Bir adım daha 🎯</h2>
                    <p className="text-white/80 text-sm mt-1">Her kayıt tasarruf için bir fırsat</p>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-t-3xl pt-6 pb-4 px-5">
                    <h3 className="text-center text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Son 30 Günün</h3>

                    <div className="space-y-3">
                        {/* Consumption */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Fuel className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 text-sm font-medium">YAKIT TÜKETİMİ</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-900">{stats.consumption.toFixed(2)} L/100KM</span>
                                <span className={`flex items-center text-sm font-bold ${changeColor(stats.consumptionChange)}`}>
                                    {changeIcon(stats.consumptionChange)}
                                    {Math.abs(stats.consumptionChange) >= 1 && `${stats.consumptionChange > 0 ? '+' : ''}${stats.consumptionChange.toFixed(0)}%`}
                                </span>
                            </div>
                        </div>

                        {/* Distance */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Route className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 text-sm font-medium">TOPLAM GİDİLEN MESAFE</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-900">{stats.distance.toLocaleString('tr-TR')} KM</span>
                                <span className={`flex items-center text-sm font-bold ${changeColor(stats.distanceChange, true)}`}>
                                    {changeIcon(stats.distanceChange)}
                                    {Math.abs(stats.distanceChange) >= 1 && `${stats.distanceChange > 0 ? '+' : ''}${stats.distanceChange.toFixed(0)}%`}
                                </span>
                            </div>
                        </div>

                        {/* Since Last Fuel */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Fuel className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 text-sm font-medium">SON DEPOYA GÖRE</span>
                            </div>
                            <span className="font-bold text-gray-900">{stats.sinceFuelDistance.toLocaleString('tr-TR')} KM</span>
                        </div>

                        {/* Cost */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Wallet className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 text-sm font-medium">TOPLAM HARCAMA</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-900">₺{stats.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                <span className={`flex items-center text-sm font-bold ${changeColor(stats.costChange)}`}>
                                    {changeIcon(stats.costChange)}
                                    {Math.abs(stats.costChange) >= 1 && `${stats.costChange > 0 ? '+' : ''}${stats.costChange.toFixed(0)}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Got It Button */}
                <div className="bg-white px-5 pb-6">
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        Devam Et
                    </button>
                </div>
            </div>
        </div>
    );
};
