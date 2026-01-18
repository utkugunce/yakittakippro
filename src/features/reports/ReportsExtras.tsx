import React, { useMemo, useRef } from 'react';
import { DailyLog } from '../../../types';
import { FuelPurchase } from '../../../FuelPurchaseForm';
import { X, Calendar, Route, Fuel, Wallet, Share2, Download, Image, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface MonthlyDrilldownProps {
    isOpen: boolean;
    onClose: () => void;
    monthKey: string; // YYYY-MM format
    logs: DailyLog[];
    purchases: FuelPurchase[];
}

export const MonthlyDrilldown: React.FC<MonthlyDrilldownProps> = ({ isOpen, onClose, monthKey, logs, purchases }) => {
    if (!isOpen) return null;

    const monthDate = new Date(monthKey + '-01');
    const monthName = monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    // Filter data for selected month
    const monthLogs = useMemo(() => {
        return logs.filter(l => {
            const d = new Date(l.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs, monthKey]);

    const monthPurchases = useMemo(() => {
        return purchases.filter(p => {
            const d = new Date(p.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [purchases, monthKey]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalDistance = monthLogs.reduce((sum, l) => sum + l.dailyDistance, 0);
        const totalCostLogs = monthLogs.reduce((sum, l) => sum + l.dailyCost, 0);
        const totalCostPurchases = monthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalFuelLogs = monthLogs.reduce((sum, l) => sum + l.dailyFuelConsumed, 0);
        const totalFuelPurchases = monthPurchases.reduce((sum, p) => sum + p.liters, 0);

        return {
            distance: totalDistance,
            cost: totalCostLogs + totalCostPurchases,
            fuel: totalFuelLogs + totalFuelPurchases,
            avgConsumption: totalDistance > 0 ? ((totalFuelLogs + totalFuelPurchases) / totalDistance) * 100 : 0,
            logCount: monthLogs.length,
            purchaseCount: monthPurchases.length
        };
    }, [monthLogs, monthPurchases]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5" />
                        <h2 className="text-lg font-bold">{monthName}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Kapat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <Route className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{totals.distance.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Kilometre</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <Wallet className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-800 dark:text-white">₺{totals.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Harcama</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <Fuel className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{totals.fuel.toFixed(1)} L</p>
                        <p className="text-[10px] text-gray-500 uppercase">Yakıt</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <Fuel className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{totals.avgConsumption.toFixed(1)}</p>
                        <p className="text-[10px] text-gray-500 uppercase">L/100km</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[400px]">
                    {/* Daily Logs */}
                    {monthLogs.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Günlük Kayıtlar ({monthLogs.length})
                            </h3>
                            <div className="space-y-2">
                                {monthLogs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {log.dailyDistance} km • {log.avgConsumption.toFixed(1)} L/100km
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800 dark:text-white">₺{log.dailyCost.toFixed(0)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{log.fuelStation || '-'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Purchases */}
                    {monthPurchases.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Yakıt Alımları ({monthPurchases.length})
                            </h3>
                            <div className="space-y-2">
                                {monthPurchases.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {p.liters.toFixed(1)} L • ₺{p.pricePerLiter.toFixed(2)}/L
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-700 dark:text-emerald-400">₺{p.totalAmount.toFixed(0)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{p.station || '-'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {monthLogs.length === 0 && monthPurchases.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Bu ay için kayıt bulunamadı.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Shareable Summary Component
interface ShareableSummaryProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
}

export const ShareableSummary: React.FC<ShareableSummaryProps> = ({ logs, purchases }) => {
    const summaryRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = React.useState(false);

    const stats = useMemo(() => {
        const totalDistance = logs.reduce((sum, l) => sum + l.dailyDistance, 0);
        const totalCost = logs.reduce((sum, l) => sum + l.dailyCost, 0) + purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalFuel = logs.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) + purchases.reduce((sum, p) => sum + p.liters, 0);
        const avgConsumption = totalDistance > 0 ? (totalFuel / totalDistance) * 100 : 0;

        // This month
        const now = new Date();
        const thisMonthLogs = logs.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const thisMonthPurchases = purchases.filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const thisMonthCost = thisMonthLogs.reduce((sum, l) => sum + l.dailyCost, 0) + thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

        return { totalDistance, totalCost, totalFuel, avgConsumption, thisMonthCost };
    }, [logs, purchases]);

    const downloadAsImage = async () => {
        if (!summaryRef.current) return;

        try {
            const canvas = await html2canvas(summaryRef.current, {
                backgroundColor: '#1f2937',
                scale: 2
            });
            const link = document.createElement('a');
            link.download = `yakit-ozet-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Image generation failed:', error);
        }
    };

    const copyStats = () => {
        const text = `🚗 Yakıt Takip Özetim

📊 Toplam: ${stats.totalDistance.toLocaleString()} km
⛽ Tüketim: ${stats.avgConsumption.toFixed(1)} L/100km
💰 Harcama: ₺${stats.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
📅 Bu Ay: ₺${stats.thisMonthCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}

#YakıtTakip`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                        <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Paylaşılabilir Özet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sosyal medyada paylaş</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={copyStats}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors"
                        title="Metni Kopyala"
                    >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                    <button
                        onClick={downloadAsImage}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-medium transition-colors"
                        title="Görsel İndir"
                    >
                        <Image className="w-3 h-3" />
                        <span>Görsel</span>
                    </button>
                </div>
            </div>

            {/* Preview Card */}
            <div
                ref={summaryRef}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Fuel className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Yakıt Takip Pro</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Toplam Mesafe</p>
                        <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString()} <span className="text-sm font-normal text-gray-400">km</span></p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Ort. Tüketim</p>
                        <p className="text-2xl font-bold">{stats.avgConsumption.toFixed(1)} <span className="text-sm font-normal text-gray-400">L/100km</span></p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Toplam Harcama</p>
                        <p className="text-2xl font-bold text-emerald-400">₺{stats.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Bu Ay</p>
                        <p className="text-2xl font-bold text-amber-400">₺{stats.thisMonthCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700 text-xs text-gray-500">
                    <span>#YakıtTakip</span>
                    <span>{new Date().toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
        </div>
    );
};
