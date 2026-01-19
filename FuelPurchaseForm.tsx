import React, { useState, useEffect, useMemo } from 'react';
import { Fuel, Calendar, Coins, Droplets, MapPin, Calculator, PlusCircle, Eraser, AlertCircle, GaugeCircle, Map, Search } from 'lucide-react';
import { LocationPicker } from './LocationPicker';
import { FuelPurchase } from './types';
import { Input } from './src/components/ui/Input';
import { Button } from './src/components/ui/Button';

interface FuelPurchaseFormProps {
    onAdd: (purchase: FuelPurchase) => void;
    onUpdate?: (purchase: FuelPurchase) => void;
    editingPurchase?: FuelPurchase | null;
    lastOdometer?: number;
    lastFuelPrice?: number;
    purchaseHistory?: FuelPurchase[];
}

const FUEL_STATIONS = ['Shell', 'Opet', 'BP', 'Petrol Ofisi', 'Total', 'Aytemiz', 'TP', 'Alpet', 'Lukoil', 'Starpet', 'Moil', 'Kadoil', 'Diğer'];

export const FuelPurchaseForm: React.FC<FuelPurchaseFormProps> = ({ onAdd, onUpdate, editingPurchase, lastOdometer = 0, lastFuelPrice = 0, purchaseHistory = [] }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [liters, setLiters] = useState<string>('');
    const [pricePerLiter, setPricePerLiter] = useState<string>('');
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [station, setStation] = useState<string>('');
    const [stationSearch, setStationSearch] = useState<string>('');
    const [odometer, setOdometer] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [calcMode, setCalcMode] = useState<'liters' | 'total'>('liters');
    const [addLocation, setAddLocation] = useState(false);
    const [locationMode, setLocationMode] = useState<'gps' | 'manual' | 'map'>('gps');
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [manualLat, setManualLat] = useState<string>('');
    const [manualLng, setManualLng] = useState<string>('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Filter stations based on search and sort by usage frequency
    const filteredStations = useMemo(() => {
        // Calculate frequency map
        const frequency: Record<string, number> = {};
        purchaseHistory.forEach(p => {
            if (p.station) {
                frequency[p.station] = (frequency[p.station] || 0) + 1;
            }
        });

        // Create a sorted list of all stations (default + custom from history)
        const allStationsSet = new Set([...FUEL_STATIONS, ...Object.keys(frequency)]);
        const allStations = Array.from(allStationsSet);

        // Sort: High frequency first
        const sortedStations = allStations.sort((a, b) => {
            const freqA = frequency[a] || 0;
            const freqB = frequency[b] || 0;
            if (freqA !== freqB) return freqB - freqA;
            const indexA = FUEL_STATIONS.indexOf(a);
            const indexB = FUEL_STATIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        if (!stationSearch) return sortedStations;
        return sortedStations.filter(s => s.toLowerCase().includes(stationSearch.toLowerCase()));
    }, [stationSearch, purchaseHistory]);

    // Reverse Geocoding to get City
    useEffect(() => {
        if (location && addLocation) {
            const fetchCity = async () => {
                try {
                    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                    if (!apiKey) return;

                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${apiKey}&language=tr`);
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        const cityResult = data.results.find((r: any) => r.types.includes('administrative_area_level_1')) ||
                            data.results.find((r: any) => r.types.includes('locality'));

                        if (cityResult) {
                            const addressComp = cityResult.address_components.find((c: any) => c.types.includes('administrative_area_level_1') || c.types.includes('locality'));
                            if (addressComp) {
                                setCity(addressComp.long_name);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            };
            fetchCity();
        } else {
            setCity('');
        }
    }, [location, addLocation]);

    // Pre-fill last fuel price disabled by user request
    // useEffect(() => {
    //     if (lastFuelPrice > 0 && !pricePerLiter && !editingPurchase) {
    //         setPricePerLiter(lastFuelPrice.toFixed(2));
    //     }
    // }, [lastFuelPrice]);

    // Populate form when editing
    useEffect(() => {
        if (editingPurchase) {
            // Split existing date string (ISO) into date and time
            const dateTime = new Date(editingPurchase.date);
            setDate(dateTime.toISOString().split('T')[0]);
            setTime(dateTime.toTimeString().slice(0, 5));
            setLiters(editingPurchase.liters.toString());
            setPricePerLiter(editingPurchase.pricePerLiter.toString());
            setTotalAmount(editingPurchase.totalAmount.toString());
            setStation(editingPurchase.station || '');
            setOdometer(editingPurchase.odometer?.toString() || '');
            setNotes(editingPurchase.notes || '');
            if (editingPurchase.latitude && editingPurchase.longitude) {
                setAddLocation(true);
                setLocation({ latitude: editingPurchase.latitude, longitude: editingPurchase.longitude });
            }
        }
    }, [editingPurchase]);

    // ... GPS Effect ...

    const handleClear = () => {
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().slice(0, 5));
        setLiters('');
        setPricePerLiter(lastFuelPrice > 0 ? lastFuelPrice.toFixed(2) : '');
        setTotalAmount('');
        setStation('');
        setOdometer('');
        setNotes('');
        setError(null);
        setAddLocation(false);
        setLocationMode('gps');
        setLocation(null);
        setManualLat('');
        setManualLng('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const l = parseFloat(liters);
        const p = parseFloat(pricePerLiter);
        const t = parseFloat(totalAmount);
        const odo = odometer ? parseFloat(odometer) : undefined;

        // Validation
        if (isNaN(l) || l <= 0) {
            setError('Lütfen geçerli bir litre miktarı girin.');
            return;
        }
        if (isNaN(p) || p <= 0) {
            setError('Lütfen geçerli bir litre fiyatı girin.');
            return;
        }
        if (isNaN(t) || t <= 0) {
            setError('Lütfen geçerli bir toplam tutar girin.');
            return;
        }

        // Check date for historical entry
        const today = new Date().toISOString().split('T')[0];
        const isHistorical = date < today;

        if (odo !== undefined && lastOdometer > 0 && odo < lastOdometer && !isHistorical) {
            setError(`Kilometre sayacı son kayıttan (${lastOdometer.toLocaleString('tr-TR')} km) düşük olamaz. Geçmiş tarihli giriş yapıyorsanız tarihi kontrol edin.`);
            return;
        }

        // Combine date and time
        const combinedDateTime = new Date(`${date}T${time || '00:00'}:00`).toISOString();

        const purchase: FuelPurchase = {
            id: editingPurchase?.id || crypto.randomUUID(),
            date: combinedDateTime,
            liters: l,
            pricePerLiter: p,
            totalAmount: t,
            station: station.trim() || undefined,
            odometer: odo,
            latitude: location?.latitude,
            longitude: location?.longitude,
            city: city || undefined,
            notes: notes.trim() || undefined
        };

        if (editingPurchase && onUpdate) {
            onUpdate(purchase);
        } else {
            onAdd(purchase);
        }
        handleClear();
    };

    const inputBaseClasses = "w-full pl-10 pr-4 py-3 min-h-[48px] bg-[#333333] dark:bg-gray-700 text-gray-100 placeholder-gray-500 border border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all [color-scheme:dark] appearance-none";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-md">
                        <Fuel className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Yakıt Alımı</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Yakıt doldurma bilgilerini girin</p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Date and Time */}
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Tarih"
                        type="date"
                        icon={Calendar}
                        required
                        aria-label="Tarih"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Input
                        label="Saat"
                        type="time"
                        required
                        aria-label="Saat"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                {/* Fuel Station Search & Select */}
                <div>
                    <label className={labelClasses}>İstasyon / Marka</label>
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="İstasyon Ara veya Ekle..."
                                value={stationSearch}
                                onChange={(e) => setStationSearch(e.target.value)}
                                className={`${inputBaseClasses} pl-9`}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            {/* Show 'Add Custom' button if search exists and not in list */}
                            {stationSearch && !filteredStations.some(s => s.toLowerCase() === stationSearch.toLowerCase()) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStation(stationSearch);
                                        setStationSearch('');
                                    }}
                                    className="px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                >
                                    + Ekle: "{stationSearch}"
                                </button>
                            )}

                            {/* Selected Station (if not in filtered list) */}
                            {station && !filteredStations.includes(station) && !stationSearch && (
                                <button
                                    type="button"
                                    onClick={() => setStation('')} // Click to deselect
                                    className="px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                                >
                                    {station} (Seçili)
                                </button>
                            )}

                            {filteredStations.map((brand) => (
                                <button
                                    key={brand}
                                    type="button"
                                    onClick={() => {
                                        setStation(brand === station ? '' : brand);
                                        setStationSearch('');
                                    }}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${station === brand
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                                        : 'bg-[#333333] dark:bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600'
                                        }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calculation Mode Toggle */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
                        <button
                            type="button"
                            onClick={() => setCalcMode('liters')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${calcMode === 'liters'
                                ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Litre Gir
                        </button>
                        <button
                            type="button"
                            onClick={() => setCalcMode('total')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${calcMode === 'total'
                                ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Tutar Gir
                        </button>
                    </div>
                </div>

                {/* Liters */}
                <Input
                    label="Alınan Litre"
                    helperText={calcMode === 'total' ? "(Otomatik)" : undefined}
                    type="number"
                    step="0.01"
                    required
                    placeholder="Örn: 45.5"
                    value={liters}
                    onChange={(e) => {
                        setLiters(e.target.value);
                        if (calcMode !== 'liters') setCalcMode('liters');
                    }}
                    icon={Droplets}
                    className={calcMode === 'total' ? 'bg-gray-600/50' : ''}
                />

                {/* Price Per Liter */}
                <Input
                    label="Litre Fiyatı (TL/L)"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Örn: 42.50"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
                    icon={Coins}
                    helperText={lastFuelPrice > 0 ? `Son fiyat: ₺${lastFuelPrice.toFixed(2)}` : undefined}
                />

                {/* Total Amount */}
                <Input
                    label="Toplam Tutar (TL)"
                    helperText={calcMode === 'liters' ? "(Otomatik)" : undefined}
                    type="number"
                    step="0.01"
                    required
                    placeholder="Örn: 1933.75"
                    value={totalAmount}
                    onChange={(e) => {
                        setTotalAmount(e.target.value);
                        if (calcMode !== 'total') setCalcMode('total');
                    }}
                    icon={Calculator}
                    className={calcMode === 'liters' ? 'bg-gray-600/50' : ''}
                />

                {/* Summary Card */}
                {parseFloat(liters) > 0 && parseFloat(totalAmount) > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Yakıt Alımı</span>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{parseFloat(liters).toFixed(2)} L</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Ödenen</span>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₺{parseFloat(totalAmount).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Odometer (Optional) */}
                <Input
                    label="Güncel KM (Opsiyonel)"
                    type="number"
                    step="1"
                    placeholder={lastOdometer > 0 ? `Son: ${lastOdometer.toLocaleString('tr-TR')} km` : 'Örn: 52000'}
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    icon={GaugeCircle}
                />

                {/* Notes (Optional) */}
                <div>
                    <label className={labelClasses}>Notlar (Opsiyonel)</label>
                    <div className="relative">
                        <textarea
                            rows={2}
                            placeholder="Eklemek istediğiniz notlar..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={`${inputBaseClasses} resize-none pl-4`}
                        />
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                            <MapPin className={`w-5 h-5 mr-2 ${location ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {location ? `Konum Eklendi ${city ? `(${city})` : ''}` : 'Konum Ekle'}
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={addLocation}
                                aria-label="Konum Ekle"
                                onChange={(e) => setAddLocation(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    {addLocation && (
                        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {/* GPS / Harita / Manuel Toggle */}
                            <div className="flex justify-center w-full">
                                <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-600 p-1 rounded-lg w-full">
                                    <button
                                        type="button"
                                        onClick={() => setLocationMode('gps')}
                                        className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${locationMode === 'gps'
                                            ? 'bg-white dark:bg-gray-500 text-green-600 dark:text-green-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        📍 GPS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocationMode('map');
                                            setShowMapPicker(true);
                                        }}
                                        className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${locationMode === 'map'
                                            ? 'bg-white dark:bg-gray-500 text-green-600 dark:text-green-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        🗺️ Haritadan Seç
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocationMode('manual');
                                            setLocation(null);
                                        }}
                                        className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${locationMode === 'manual'
                                            ? 'bg-white dark:bg-gray-500 text-green-600 dark:text-green-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        ✏️ Manuel
                                    </button>
                                </div>
                            </div>

                            {/* GPS Mode Content */}
                            {locationMode === 'gps' && (
                                <div className="text-center">
                                    {gpsLoading ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            📡 Konum alınıyor...
                                        </p>
                                    ) : location ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            ✅ {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setLocationMode('gps')}
                                            className="text-sm text-blue-600 dark:text-blue-400 underline"
                                        >
                                            Konumu yeniden al
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Map Mode Content */}
                            {locationMode === 'map' && (
                                <div className="text-center space-y-2">
                                    {location ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            ✅ {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Haritadan konum seçilmedi
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowMapPicker(true)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all flex items-center space-x-2 mx-auto"
                                    >
                                        <Map className="w-4 h-4" />
                                        <span>{location ? 'Konumu Değiştir' : 'Haritayı Aç'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Manuel Mode Content */}
                            {locationMode === 'manual' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                                            Enlem (Latitude)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.00001"
                                            placeholder="Örn: 41.0082"
                                            value={manualLat}
                                            onChange={(e) => setManualLat(e.target.value)}
                                            className="w-full px-3 py-2 bg-[#333333] dark:bg-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                                            Boylam (Longitude)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.00001"
                                            placeholder="Örn: 28.9784"
                                            value={manualLng}
                                            onChange={(e) => setManualLng(e.target.value)}
                                            className="w-full px-3 py-2 bg-[#333333] dark:bg-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    {location && (
                                        <p className="col-span-2 text-xs text-green-600 dark:text-green-400 text-center">
                                            ✅ Geçerli koordinatlar
                                        </p>
                                    )}
                                    <p className="col-span-2 text-xs text-gray-400 text-center">
                                        💡 Google Maps'ten koordinat kopyalayabilirsiniz
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 mt-4 border-t dark:border-gray-700">
                    <Button
                        type="button"
                        onClick={handleClear}
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                        leftIcon={Eraser}
                    >
                        Temizle
                    </Button>

                    <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        className="flex-[2] shadow-md hover:shadow-lg"
                        leftIcon={PlusCircle}
                    >
                        Yakıt Alımı Kaydet
                    </Button>
                </div>
            </form>

            {/* Location Picker Modal */}
            {showMapPicker && (
                <LocationPicker
                    onSelect={(lat, lng) => {
                        setLocation({ latitude: lat, longitude: lng });
                        setShowMapPicker(false);
                    }}
                    onClose={() => setShowMapPicker(false)}
                    initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
                />
            )}
        </div>
    );
};

export default FuelPurchaseForm;
