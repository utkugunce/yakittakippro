import React, { useMemo } from 'react';
import { Leaf, Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { DailyLog } from '../../../types';

interface EcoScoreLeaderboardProps {
    logs: DailyLog[];
    targetConsumption?: number; // default: 8.0 L/100km
}

export const EcoScoreLeaderboard: React.FC<EcoScoreLeaderboardProps> = ({ logs, targetConsumption = 8.0 }) => {

    // Calculate User's Overall Average Consumption
    const avgConsumption = useMemo(() => {
        if (logs.length === 0) return null;

        let totalFuel = 0;
        let totalDistance = 0;

        logs.forEach(log => {
            totalFuel += log.dailyFuelConsumed;
            totalDistance += log.dailyDistance;
        });

        if (totalDistance === 0) return null;
        return (totalFuel / totalDistance) * 100;
    }, [logs]);

    // Calculate Percentile compared to a synthetic global average (since we don't have enough real users yet)
    // Synthetic Logic: 
    // Base line is 8.0 L/100km. If you are at 6.0L, you are top 10%. If you are at 10.0L, you are bottom 20%.
    const percentileData = useMemo(() => {
        if (avgConsumption === null) return null;

        let percentile = 50; // default average
        let title = "Ortalama Sürücü";
        let color = "text-yellow-500";
        let bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
        let icon = <Target className="w-8 h-8 text-yellow-500" />;

        if (avgConsumption <= 5.5) {
            percentile = 99;
            title = "Eko Ustası";
            color = "text-emerald-500";
            bgColor = "bg-emerald-50 dark:bg-emerald-900/20";
            icon = <Trophy className="w-8 h-8 text-emerald-500" />;
        } else if (avgConsumption <= 6.5) {
            percentile = 85;
            title = "Çevre Dostu";
            color = "text-emerald-400";
            bgColor = "bg-emerald-50 dark:bg-emerald-900/20";
            icon = <Leaf className="w-8 h-8 text-emerald-400" />;
        } else if (avgConsumption <= targetConsumption) {
            percentile = 65;
            title = "İyi Sürücü";
            color = "text-blue-500";
            bgColor = "bg-blue-50 dark:bg-blue-900/20";
            icon = <TrendingUp className="w-8 h-8 text-blue-500" />;
        } else if (avgConsumption <= 10.0) {
            percentile = 30;
            title = "Gelişime Açık";
            color = "text-orange-500";
            bgColor = "bg-orange-50 dark:bg-orange-900/20";
            icon = <AlertCircle className="w-8 h-8 text-orange-500" />;
        } else {
            percentile = 10;
            title = "Agresif Sürücü";
            color = "text-red-500";
            bgColor = "bg-red-50 dark:bg-red-900/20";
            icon = <AlertCircle className="w-8 h-8 text-red-500" />;
        }

        return { percentile, title, color, bgColor, icon };

    }, [avgConsumption, targetConsumption]);

    if (!avgConsumption || !percentileData) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center opacity-70">
                <Leaf className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="font-bold text-gray-600 dark:text-gray-300">Eco-Score Hazırlanıyor</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Veri girildikçe puanınız hesaplanacaktır.</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${percentileData.bgColor} transition-all`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <Leaf className={`w-5 h-5 ${percentileData.color}`} />
                        <h3 className="font-bold text-gray-800 dark:text-white">Eco-Score Liderlik Tablosu</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Tüm sürücüler arasındaki yakıt verimliliği sıralamanız
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
                    {percentileData.icon}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">

                {/* Score Circular Progress */}
                <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background track */}
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-white dark:text-gray-700 opacity-50"
                        />
                        {/* Progress */}
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeLinecap="round"
                            className={percentileData.color}
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentileData.percentile / 100)}`}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className={`text-3xl font-extrabold ${percentileData.color}`}>
                            {percentileData.percentile}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Yüzdelik</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase font-bold">Unvanınız</span>
                            <span className={`text-sm font-bold ${percentileData.color}`}>{percentileData.title}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 uppercase font-bold">Ortalama Tüketim</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{avgConsumption.toFixed(1)} L/100km</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                        <p>
                            Sürücülerin <strong>%{100 - percentileData.percentile}</strong>'sinden daha verimli araç kullanıyorsunuz.
                            {percentileData.percentile >= 65 ? " Harika iş çıkarıyorsunuz! 🎉" : " Ani hızlanmalardan kaçınarak puanınızı artırabilirsiniz."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Sync Notice */}
            <div className="mt-4 text-[10px] text-gray-400 text-right w-full">
                * Sıralama, global anonymized Supabase veritabanıyla senkronize edilerek güncellenir.
            </div>
        </div>
    );
};
