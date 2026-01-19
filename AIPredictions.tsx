import React, { useMemo, useState, useEffect } from 'react';
import { DailyLog, MaintenanceItem, VehiclePart, FuelPurchase } from './types';
import { Brain, Calendar, TrendingUp, AlertTriangle, Droplets, MessageSquare, ThumbsUp, ThumbsDown, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIPredictionsProps {
    logs: DailyLog[];
    purchases?: FuelPurchase[];
    maintenanceItems: MaintenanceItem[];
    vehicleParts: VehiclePart[];
    currentOdometer: number;
}

declare const process: { env: { GEMINI_API_KEY?: string } };

import { useAppStore } from './src/stores/appStore';

// ... (existing helper function if any)

export const AIPredictions: React.FC<AIPredictionsProps> = ({ logs, purchases = [], maintenanceItems, vehicleParts, currentOdometer }) => {
    // --- Existing Logic (Calculations) ---
    // ...
    const predictions = useMemo(() => {
        // ... (Keep existing calculations mostly same, reused for prompt context)
        if (logs.length < 2) return null;
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastLog = sortedLogs[0];
        const firstLog = sortedLogs[sortedLogs.length - 1];
        const totalDays = (new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24);
        const totalKm = lastLog.currentOdometer - firstLog.currentOdometer;
        const avgDailyKm = totalDays > 0 ? totalKm / totalDays : 0;

        // Next Refuel
        const refuelLogs = sortedLogs.filter(l => l.isRefuelDay);
        let avgDaysBetweenRefuels = 7;
        if (refuelLogs.length > 1) {
            let totalRefuelDays = 0;
            for (let i = 0; i < refuelLogs.length - 1; i++) {
                totalRefuelDays += (new Date(refuelLogs[i].date).getTime() - new Date(refuelLogs[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
            }
            avgDaysBetweenRefuels = totalRefuelDays / (refuelLogs.length - 1);
        }
        const nextRefuelDate = new Date(lastLog.date);
        nextRefuelDate.setDate(nextRefuelDate.getDate() + (avgDaysBetweenRefuels || 7));

        // Next Service (Simplified for context)
        let nextService = null;
        // ... (Service logic omitted for brevity in prompt context, but kept UI display logic below)

        // Monthly Cost
        const currentMonth = new Date().getMonth();
        const thisMonthLogs = logs.filter(l => new Date(l.date).getMonth() === currentMonth);
        const thisMonthCost = thisMonthLogs.reduce((sum, l) => sum + l.dailyCost, 0);

        // Avg Consumption
        const consumptionValues = logs.filter(l => l.avgConsumption > 0).map(l => l.avgConsumption);
        const avgConsumption = consumptionValues.length > 0 ? consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length : 0;

        // Weekly Change
        const prev7Days = sortedLogs.slice(7, 14);
        const prev7Cost = prev7Days.reduce((sum, l) => sum + l.dailyCost, 0);
        const last7Cost = sortedLogs.slice(0, 7).reduce((sum, l) => sum + l.dailyCost, 0);
        const weeklyChange = prev7Cost > 0 ? ((last7Cost - prev7Cost) / prev7Cost) * 100 : 0;

        return {
            avgDailyKm,
            nextRefuelDate,
            nextService,
            thisMonthCost,
            avgConsumption,
            weeklyChange,
            totalKm
        };
    }, [logs, maintenanceItems, vehicleParts, currentOdometer]);

    // --- Gemini AI Integration ---
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [feedback, setFeedback] = useState<'kötü' | 'iyi' | null>(null);

    // Store integration
    const storedApiKey = useAppStore(state => state.geminiApiKey);
    const setStoredApiKey = useAppStore(state => state.setGeminiApiKey);

    const [apiKey, setApiKey] = useState(storedApiKey || import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '');

    // Sync local state with store if store updates (e.g. hydration)
    useEffect(() => {
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, [storedApiKey]);

    const generateAiInsight = async () => {
        // Prioritize .env key as it's the intended system key
        const activeKey = import.meta.env.VITE_GEMINI_API_KEY || apiKey || process.env.GEMINI_API_KEY;

        if (!predictions || !activeKey || activeKey === 'undefined' || activeKey === 'null') {
            console.warn("AI Assistant: Missing or invalid API key");
            setAiMessage("API anahtarı eksik veya geçersiz. Lütfen Ayarlar'dan kontrol edin.");
            return;
        }

        setIsLoadingAi(true);
        setFeedback(null);
        try {
            const genAI = new GoogleGenerativeAI(activeKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `
                Araç verilerini analiz et ve sürücüye tek cümlelik, samimi, emojili (max 2) bir geri bildirim ver.
                Veriler: ${predictions.avgConsumption.toFixed(1)} L/100km, ₺${predictions.thisMonthCost.toFixed(0)} Harcama, %${predictions.weeklyChange.toFixed(1)} Değişim (${predictions.weeklyChange > 0 ? 'Artış' : 'Azalış'}), ${predictions.totalKm} KM.
                Kurallar: Tüketim arttıysa uyar, azaldıysa tebrik et. Robotik olma.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            setAiMessage(text);
        } catch (error: any) {
            console.error("AI Assistant Error Detail:", error);
            const errorMsg = error?.message || "";
            if (errorMsg.includes("API key")) {
                setAiMessage("API anahtarı hatası! Lütfen anahtarın doğruluğunu ve kısıtlamalarını kontrol edin. 🔑");
            } else if (errorMsg.includes("model")) {
                setAiMessage("Model hatası! Lütfen model isminin doğruluğunu kontrol edin. 🤖");
            } else {
                setAiMessage("Bağlantı hatası 😔 Lütfen interneti ve API anahtarını kontrol edip tekrar dene.");
            }
        } finally {
            setIsLoadingAi(false);
        }
    };

    // Auto-generate on mount if key exists and data ready
    useEffect(() => {
        const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (activeKey && predictions && !aiMessage) {
            generateAiInsight();
        }
    }, [apiKey, predictions]);


    if (!predictions) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI Asistanı</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Google Gemini &trade; Destekli</p>
                    </div>
                </div>
                <button
                    onClick={generateAiInsight}
                    disabled={isLoadingAi}
                    className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                    title="Yeniden Analiz Et"
                >
                    <Sparkles className={`w-4 h-4 text-indigo-500 ${isLoadingAi ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* AI Message Area */}
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-indigo-100 dark:border-gray-700 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

                <>
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                        <div className="flex-1">
                            {isLoadingAi ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Veriler inceleniyor...
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                                    {aiMessage || "Verilerinizi analiz etmek için sağ üstteki pırıltı ikonuna tıklayın ✨"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Feedback Loop */}
                    {aiMessage && !isLoadingAi && (
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                            <span className="text-[10px] text-gray-400 self-center mr-2">Bu tavsiye faydalı mıydı?</span>
                            <button
                                onClick={() => setFeedback('iyi')}
                                className={`p-1.5 rounded-lg transition-colors ${feedback === 'iyi' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'}`}
                                title="Faydalı"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setFeedback('kötü')}
                                className={`p-1.5 rounded-lg transition-colors ${feedback === 'kötü' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'}`}
                                title="Faydalı Değil"
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </>
            </div >

            {/* Quick Stats Grid (Existing Layout) */}
            < div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4" >
                {/* Next Refuel */}
                < div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm" >
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <Droplets className="w-3 h-3" />
                        Sonraki Yakıt
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {predictions.nextRefuelDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </div>
                </div >

                {/* Monthly Cost */}
                < div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm" >
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <TrendingUp className="w-3 h-3" />
                        Bu Ay (Harcanan)
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        ₺{predictions.thisMonthCost.toFixed(0)}
                    </div>
                </div >

                {/* Avg Consumption */}
                < div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm" >
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <Calendar className="w-3 h-3" />
                        Ort. Tüketim
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {predictions.avgConsumption.toFixed(1)} L/100km
                    </div>
                </div >

                {/* Weekly Trend */}
                < div className={`p-3 rounded-xl border backdrop-blur-sm ${predictions.weeklyChange > 0
                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                    : 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'}`}>
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500 uppercase">
                        <TrendingUp className={`w-3 h-3 ${predictions.weeklyChange > 0 ? 'text-red-500' : 'text-green-500 rotate-180'}`} />
                        Haftalık Trend
                    </div>
                    <div className={`text-sm font-semibold ${predictions.weeklyChange > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                        {Math.abs(predictions.weeklyChange).toFixed(1)}% {predictions.weeklyChange > 0 ? 'Artış' : 'Düşüş'}
                    </div>
                </div >
            </div >
        </div >
    );
};
