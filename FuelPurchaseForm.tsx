import React, { useState, useEffect } from 'react';
import { Fuel, Calendar, Coins, Droplets, MapPin, Calculator, PlusCircle, Eraser, AlertCircle, GaugeCircle } from 'lucide-react';

export interface FuelPurchase {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  station?: string;
  odometer?: number;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface FuelPurchaseFormProps {
  onAdd: (purchase: FuelPurchase) => void;
  lastOdometer?: number;
  lastFuelPrice?: number;
}

const FUEL_STATIONS = ['Shell', 'Opet', 'BP', 'Petrol Ofisi', 'Total', 'Aytemiz', 'TP', 'Alpet', 'Diğer'];

export const FuelPurchaseForm: React.FC<FuelPurchaseFormProps> = ({ onAdd, lastOdometer = 0, lastFuelPrice = 0 }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [station, setStation] = useState<string>('');
  const [odometer, setOdometer] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Calculation mode: 'auto' calculates total, 'manual' allows direct input
  const [calcMode, setCalcMode] = useState<'liters' | 'total'>('liters');
  
  // Location
  const [addLocation, setAddLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Pre-fill last fuel price
  useEffect(() => {
    if (lastFuelPrice > 0 && !pricePerLiter) {
      setPricePerLiter(lastFuelPrice.toFixed(2));
    }
  }, [lastFuelPrice]);

  // Get location when enabled
  useEffect(() => {
    if (addLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (err) => {
            console.error('Location error:', err);
            alert('Konum alınamadı. Lütfen izinleri kontrol edin.');
            setAddLocation(false);
          }
        );
      } else {
        alert('Tarayıcınız konum özelliğini desteklemiyor.');
        setAddLocation(false);
      }
    } else {
      setLocation(null);
    }
  }, [addLocation]);

  // Auto-calculate total amount when liters and price change (in liters mode)
  useEffect(() => {
    if (calcMode === 'liters') {
      const l = parseFloat(liters);
      const p = parseFloat(pricePerLiter);
      if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
        setTotalAmount((l * p).toFixed(2));
      }
    }
  }, [liters, pricePerLiter, calcMode]);

  // Auto-calculate liters when total and price change (in total mode)
  useEffect(() => {
    if (calcMode === 'total') {
      const t = parseFloat(totalAmount);
      const p = parseFloat(pricePerLiter);
      if (!isNaN(t) && !isNaN(p) && t > 0 && p > 0) {
        setLiters((t / p).toFixed(2));
      }
    }
  }, [totalAmount, pricePerLiter, calcMode]);

  const handleClear = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setLiters('');
    setPricePerLiter(lastFuelPrice > 0 ? lastFuelPrice.toFixed(2) : '');
    setTotalAmount('');
    setStation('');
    setOdometer('');
    setNotes('');
    setError(null);
    setAddLocation(false);
    setLocation(null);
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
    if (odo !== undefined && lastOdometer > 0 && odo < lastOdometer) {
      setError(`Kilometre sayacı son kayıttan (${lastOdometer.toLocaleString('tr-TR')} km) düşük olamaz.`);
      return;
    }

    const purchase: FuelPurchase = {
      id: crypto.randomUUID(),
      date,
      liters: l,
      pricePerLiter: p,
      totalAmount: t,
      station: station.trim() || undefined,
      odometer: odo,
      latitude: location?.latitude,
      longitude: location?.longitude,
      notes: notes.trim() || undefined
    };

    onAdd(purchase);
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
        {/* Date */}
        <div>
          <label className={labelClasses}>Tarih</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>

        {/* Fuel Station Quick Select */}
        <div>
          <label className={labelClasses}>İstasyon / Marka</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FUEL_STATIONS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setStation(brand)}
                className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border ${
                  station === brand
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                    : 'bg-[#333333] dark:bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Mode Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
            <button
              type="button"
              onClick={() => setCalcMode('liters')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                calcMode === 'liters'
                  ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Litre Gir
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('total')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                calcMode === 'total'
                  ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tutar Gir
            </button>
          </div>
        </div>

        {/* Liters */}
        <div>
          <label className={labelClasses}>
            Alınan Litre {calcMode === 'total' && <span className="text-gray-400">(Otomatik)</span>}
          </label>
          <div className="relative">
            <Droplets className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Örn: 45.5"
              value={liters}
              onChange={(e) => {
                setLiters(e.target.value);
                if (calcMode !== 'liters') setCalcMode('liters');
              }}
              className={`${inputBaseClasses} ${calcMode === 'total' ? 'bg-gray-600/50' : ''}`}
            />
          </div>
        </div>

        {/* Price Per Liter */}
        <div>
          <label className={labelClasses}>Litre Fiyatı (TL/L)</label>
          <div className="relative">
            <Coins className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Örn: 42.50"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
          {lastFuelPrice > 0 && (
            <p className="text-xs text-gray-400 mt-1">Son fiyat: ₺{lastFuelPrice.toFixed(2)}</p>
          )}
        </div>

        {/* Total Amount */}
        <div>
          <label className={labelClasses}>
            Toplam Tutar (TL) {calcMode === 'liters' && <span className="text-gray-400">(Otomatik)</span>}
          </label>
          <div className="relative">
            <Calculator className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Örn: 1933.75"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(e.target.value);
                if (calcMode !== 'total') setCalcMode('total');
              }}
              className={`${inputBaseClasses} ${calcMode === 'liters' ? 'bg-gray-600/50' : ''}`}
            />
          </div>
        </div>

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
        <div>
          <label className={labelClasses}>Güncel KM (Opsiyonel)</label>
          <div className="relative">
            <GaugeCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="1"
              placeholder={lastOdometer > 0 ? `Son: ${lastOdometer.toLocaleString('tr-TR')} km` : 'Örn: 52000'}
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>

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

        {/* Location Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <MapPin className={`w-5 h-5 mr-2 ${location ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {location ? 'Konum Eklendi' : 'Konum Ekle'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addLocation}
              onChange={(e) => setAddLocation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        {addLocation && location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <Eraser className="w-5 h-5" />
            <span>Temizle</span>
          </button>

          <button
            type="submit"
            className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Yakıt Alımı Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelPurchaseForm;
