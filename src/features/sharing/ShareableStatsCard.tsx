import React, { useRef } from 'react';
import { Share2, Download, Car, Fuel, TrendingUp, Award } from 'lucide-react';

interface StatsCardProps {
    stats: {
        totalDistance: number;
        totalCost: number;
        avgConsumption: number;
        totalFuelPurchases: number;
    };
    userName?: string;
}

export const ShareableStatsCard: React.FC<StatsCardProps> = ({ stats, userName = 'Sürücü' }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            // Dynamic import for html2canvas
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2
            });

            const link = document.createElement('a');
            link.download = `yakit-takip-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Kart indirilemedi. html2canvas yüklü değil.');
        }
    };

    const handleShare = async () => {
        const text = `🚗 TripBook İstatistiklerim\n\n` +
            `📍 ${stats.totalDistance.toLocaleString('tr-TR')} km yol\n` +
            `⛽ ${stats.totalFuelPurchases} yakıt alımı\n` +
            `💰 ₺${stats.totalCost.toLocaleString('tr-TR')} harcama\n` +
            `📊 ${stats.avgConsumption.toFixed(1)} L/100km tüketim\n\n` +
            `#YakıtTakipPro`;

        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch (e) {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(text);
            alert('İstatistikler panoya kopyalandı!');
        }
    };

    const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-4">
            {/* Card Preview */}
            <div
                ref={cardRef}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <Car className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{userName}</h2>
                            <p className="text-xs text-gray-400">TripBook</p>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs uppercase">Toplam Yol</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString('tr-TR')}</p>
                        <p className="text-xs text-gray-400">kilometre</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <Fuel className="w-4 h-4" />
                            <span className="text-xs uppercase">Tüketim</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.avgConsumption.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">L/100km</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="flex justify-between text-center border-t border-white/10 pt-4">
                    <div className="w-full">
                        <p className="text-xl font-bold text-green-400">₺{(stats.totalCost / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-gray-400">Toplam Harcama</p>
                    </div>
                    <div className="w-full border-l border-white/10 pl-4">
                        <p className="text-xl font-bold text-blue-400">{stats.totalFuelPurchases}</p>
                        <p className="text-xs text-gray-400">Yakıt Alımı</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-gray-500">{currentMonth}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Award className="w-3 h-3" />
                        <span>yakittakip.pro</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                >
                    <Download className="w-5 h-5" />
                    <span>PNG İndir</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium rounded-xl transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    <span>Paylaş</span>
                </button>
            </div>
        </div>
    );
};

export default ShareableStatsCard;
