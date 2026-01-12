import React, { useState, useMemo } from 'react';
import { FuelPurchase } from './FuelPurchaseForm';
import { Trash2, Fuel, Filter, X, Calendar, Pencil, MapPin, Droplets, Coins } from 'lucide-react';

interface FuelPurchaseHistoryProps {
    purchases: FuelPurchase[];
    onDelete: (id: string) => void;
    onEdit: (purchase: FuelPurchase) => void;
}

export const FuelPurchaseHistory: React.FC<FuelPurchaseHistoryProps> = ({
    purchases,
    onDelete,
    onEdit
}) => {
    const [filterStation, setFilterStation] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Unique stations for filter dropdown
    const uniqueStations = useMemo(() => {
        const stations = purchases.map(p => p.station).filter(Boolean) as string[];
        return [...new Set(stations)].sort();
    }, [purchases]);

    // Filtered purchases
    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            if (filterStation && p.station !== filterStation) return false;
            return true;
        });
    }, [purchases, filterStation]);

    // Sort by date descending
    const sortedPurchases = useMemo(() => {
        return [...filteredPurchases].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [filteredPurchases]);

    const clearFilters = () => {
        setFilterStation('');
    };

    const hasFilters = filterStation !== '';

    if (purchases.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Fuel className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Henüz Yakıt Alımı Kaydı Yok</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Yeşil pompa butonuna tıklayarak ilk yakıt alımınızı kaydedin.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with filter toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Fuel className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        Yakıt Alımları
                    </h2>
                    <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {sortedPurchases.length}
                    </span>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors ${showFilters || hasFilters
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                >
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtreler</span>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1"
                            >
                                <X className="w-3 h-3" />
                                <span>Temizle</span>
                            </button>
                        )}
                    </div>
                    <select
                        value={filterStation}
                        onChange={(e) => setFilterStation(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-200 text-sm"
                    >
                        <option value="">Tüm İstasyonlar</option>
                        {uniqueStations.map(station => (
                            <option key={station} value={station}>{station}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Purchase List */}
            <div className="space-y-3">
                {sortedPurchases.map(purchase => (
                    <div
                        key={purchase.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {/* Date and Station */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                                        {new Date(purchase.date).toLocaleDateString('tr-TR', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    {purchase.station && (
                                        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {purchase.station}
                                        </span>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <Droplets className="w-4 h-4 text-blue-500" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {purchase.liters.toFixed(2)} L
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            ₺{purchase.pricePerLiter.toFixed(2)}/L
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        <span className="font-bold text-gray-800 dark:text-white">
                                            ₺{purchase.totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Odometer & Location */}
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {purchase.odometer && (
                                        <span>🔢 {purchase.odometer.toLocaleString('tr-TR')} km</span>
                                    )}
                                    {purchase.latitude && purchase.longitude && (
                                        <span className="flex items-center">
                                            <MapPin className="w-3 h-3 mr-1 text-green-500" />
                                            Konum kaydedildi
                                        </span>
                                    )}
                                </div>

                                {/* Notes */}
                                {purchase.notes && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                        📝 {purchase.notes}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col space-y-2 ml-3">
                                <button
                                    onClick={() => onEdit(purchase)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Düzenle"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Bu yakıt alımını silmek istediğinizden emin misiniz?')) {
                                            onDelete(purchase.id);
                                        }
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FuelPurchaseHistory;
