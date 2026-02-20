import React, { useState, useMemo } from 'react';
import { Calculator, Map, TrendingUp } from 'lucide-react';
import { DailyLog } from '../../types';

interface DynamicBudgetSimulatorProps {
    logs: DailyLog[];
    currentFuelPrice: number;
}

export const DynamicBudgetSimulator: React.FC<DynamicBudgetSimulatorProps> = ({ logs, currentFuelPrice }) => {
    // Sliders state
    const [plannedDistance, setPlannedDistance] = useState<number>(500); // Default 500km
    const [simulatedPrice, setSimulatedPrice] = useState<number>(currentFuelPrice || 40);

    // Calculate historical average consumption
    const averageConsumption = useMemo(() => {
        if (!logs.length) return 7.5; // Default assumption

        const validLogs = logs.filter(l => l.dailyFuelConsumed > 0 && l.dailyDistance > 0);
        if (!validLogs.length) return 7.5;

        const totalFuel = validLogs.reduce((sum, log) => sum + log.dailyFuelConsumed, 0);
        const totalDist = validLogs.reduce((sum, log) => sum + log.dailyDistance, 0);

        return totalDist > 0 ? (totalFuel / totalDist) * 100 : 7.5;
    }, [logs]);

    // Live Calculation
    const requiredFuel = (plannedDistance / 100) * averageConsumption;
    const expectedCost = requiredFuel * simulatedPrice;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">Seyahat Bütçe Simülatörü</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aracınızın geçmiş tüketimine göre maliyet hesabı ({averageConsumption.toFixed(1)}L/100km)</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Distance Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Map className="w-4 h-4 text-gray-400" />
                            Planlanan Mesafe
                        </label>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{plannedDistance} km</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="2000"
                        step="10"
                        value={plannedDistance}
                        onChange={(e) => setPlannedDistance(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                    />
                </div>

                {/* Price Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            Beklenen Yakıt Fiyatı
                        </label>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{simulatedPrice.toFixed(2)} ₺/L</span>
                    </div>
                    <input
                        type="range"
                        min={Math.max(20, Math.floor(currentFuelPrice - 10))}
                        max={Math.ceil(currentFuelPrice + 20)}
                        step="0.5"
                        value={simulatedPrice}
                        onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                    />
                </div>

                {/* Results Card */}
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gereken Yakıt</p>
                            <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                                {requiredFuel.toFixed(1)} <span className="text-base font-normal text-gray-500">Litre</span>
                            </p>
                        </div>
                        <div className="border-l border-blue-200/50 dark:border-blue-800/50 pl-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tahmini Maliyet</p>
                            <p className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400">
                                {expectedCost.toFixed(0)} <span className="text-base font-normal">₺</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
