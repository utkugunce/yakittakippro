import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog } from './types';
import { PlusCircle, Fuel, Gauge, Calculator, Calendar, AlertCircle, Coins, Eraser, StickyNote, Camera, MapPin, Mic } from 'lucide-react';
import { ExcelImport } from './ExcelImport';
import { PhotoScanner } from './PhotoScanner';
import { VoiceEntry } from './VoiceEntry';

interface EntryFormProps {
  logs: DailyLog[];
  onAdd: (log: DailyLog) => void;
  onUpdate?: (log: DailyLog) => void;
  onImport: (logs: DailyLog[]) => void;
  lastOdometer: number;
  lastFuelPrice: number;
  editingLog?: DailyLog | null;
}

// Dün tarihini döndürür (sabah araçtan veri okuma için)
const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const EntryForm: React.FC<EntryFormProps> = ({ logs, onAdd, onUpdate, onImport, lastOdometer, lastFuelPrice, editingLog }) => {
  const isEditing = !!editingLog;
  const [date, setDate] = useState(editingLog?.date || getYesterdayDate());
  const [currentOdometer, setCurrentOdometer] = useState<string>('');
  const [dailyDistance, setDailyDistance] = useState<string>('');
  const [avgConsumption, setAvgConsumption] = useState<string>('');
  const [fuelPrice, setFuelPrice] = useState<string>('');
  const [fuelStation, setFuelStation] = useState<string>('');
  const [isRefuelDay, setIsRefuelDay] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Local error state for immediate feedback
  const [odoError, setOdoError] = useState<string | null>(null);
  const [showPhotoScanner, setShowPhotoScanner] = useState(false);
  const [showVoiceEntry, setShowVoiceEntry] = useState(false);

  // Location State
  const [addLocation, setAddLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  // Get Location Effect
  useEffect(() => {
    if (addLocation) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            setAddLocation(false); // Disable if error
            alert("Konum alınamadı. Lütfen izinleri kontrol edin.");
          }
        );
      } else {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
        setAddLocation(false);
      }
    } else {
      setLocation(null);
    }
  }, [addLocation]);

  // Pre-fill current odometer from last log (only when not editing)
  useEffect(() => {
    if (!isEditing && lastOdometer > 0) {
      setCurrentOdometer(lastOdometer.toString());
    }
  }, [lastOdometer, isEditing]);

  // Pre-fill form when editing an existing log
  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setCurrentOdometer(editingLog.currentOdometer.toString());
      setDailyDistance(editingLog.dailyDistance.toString());
      setAvgConsumption(editingLog.avgConsumption.toString());
      setFuelPrice(editingLog.fuelPrice.toString());
      setFuelStation(editingLog.fuelStation || '');
      setIsRefuelDay(editingLog.isRefuelDay);
      setNotes(editingLog.notes || '');
    }
  }, [editingLog]);

  // Calculate daily distance when odometer changes with Real-time Validation
  // Skip auto-calculation when editing (user may want to keep the original distance)
  useEffect(() => {
    // Don't auto-calculate when editing
    if (isEditing) return;

    if (currentOdometer) {
      const current = parseFloat(currentOdometer);

      if (!isNaN(current)) {
        if (lastOdometer > 0 && current < lastOdometer) {
          setOdoError(`Hata: Girilen KM (${current.toLocaleString()}), son KM'den (${lastOdometer.toLocaleString()}) küçük olamaz.`);
          setDailyDistance(''); // Invalid distance
        } else {
          setOdoError(null);
          if (lastOdometer > 0) {
            setDailyDistance((current - lastOdometer).toFixed(1));
          }
        }
      } else {
        setOdoError(null);
      }
    } else {
      setOdoError(null);
    }
    // Clear general error when typing
    if (error) setError(null);
  }, [currentOdometer, lastOdometer]);

  // Pre-fill fuel price from last refuel - updates whenever lastFuelPrice changes
  // When isRefuelDay is false, always use the last known fuel price
  useEffect(() => {
    if (lastFuelPrice > 0 && !isRefuelDay) {
      setFuelPrice(lastFuelPrice.toFixed(2));
    }
  }, [lastFuelPrice, isRefuelDay]);

  // Live Calculations
  const liveStats = useMemo(() => {
    const dist = parseFloat(dailyDistance);
    const cons = parseFloat(avgConsumption);
    const price = parseFloat(fuelPrice);

    if (!isNaN(dist) && !isNaN(cons) && !isNaN(price) && dist > 0) {
      const consumed = (dist * cons) / 100;
      const cost = consumed * price;
      return {
        consumed: consumed.toFixed(1),
        cost: cost.toFixed(2)
      };
    }
    return null;
  }, [dailyDistance, avgConsumption, fuelPrice]);

  const handleClear = () => {
    setDate(getYesterdayDate());
    // Reset to initial logical state
    if (lastOdometer > 0) setCurrentOdometer(lastOdometer.toString());
    else setCurrentOdometer('');

    setDailyDistance('');
    setAvgConsumption('');

    if (lastFuelPrice > 0) setFuelPrice(lastFuelPrice.toString());
    else setFuelPrice('');

    setFuelStation('');
    setIsRefuelDay(false);
    setNotes('');
    setError(null);
    setOdoError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Block if there is an active odometer error
    if (odoError) return;

    const dist = parseFloat(dailyDistance);
    const cons = parseFloat(avgConsumption);
    const price = parseFloat(fuelPrice);
    const currOdo = parseFloat(currentOdometer);

    if (isNaN(dist) || isNaN(cons) || isNaN(price) || isNaN(currOdo)) {
      setError("Lütfen tüm alanları geçerli sayılarla doldurun.");
      return;
    }

    // STRICT VALIDATION: Prevent KM rollback (only when adding new, not editing)
    if (!isEditing && lastOdometer > 0 && currOdo < lastOdometer) {
      setError(`Hata: Yeni KM (${currOdo.toLocaleString()}), son kaydedilen KM'den (${lastOdometer.toLocaleString()}) düşük olamaz.`);
      return;
    }

    // Calculations
    const dailyFuelConsumed = (dist * cons) / 100;
    const dailyCost = dailyFuelConsumed * price;
    const costPerKm = dist > 0 ? dailyCost / dist : 0;

    const logData: DailyLog = {
      id: isEditing ? editingLog!.id : crypto.randomUUID(),
      date,
      currentOdometer: currOdo,
      dailyDistance: dist,
      avgConsumption: cons,
      isRefuelDay,
      fuelPrice: price,
      dailyFuelConsumed,
      dailyCost,
      costPerKm,
      fuelStation: fuelStation.trim(),
      notes: notes.trim(),
      latitude: location?.latitude,
      longitude: location?.longitude
    };

    if (isEditing && onUpdate) {
      onUpdate(logData);
    } else {
      onAdd(logData);
    }

    // Reset form but keep smart defaults
    setDailyDistance('');
    setAvgConsumption('');
    setCurrentOdometer(''); // Will trigger useEffect to reset to new Last Odometer
    setFuelStation('');
    setIsRefuelDay(false);
    setNotes('');
    setError(null);
    setOdoError(null);
  };

  const inputBaseClasses = "w-full pl-10 pr-4 py-3 min-h-[48px] bg-[#333333] dark:bg-gray-700 text-gray-100 placeholder-gray-500 border border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all [color-scheme:dark] appearance-none box-border";
  const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-colors">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div className="flex items-center space-x-2">
          <PlusCircle className="text-primary-600 dark:text-primary-400 w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Veri Girişi</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowVoiceEntry(true)}
            className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
            title="Sesle Giriş"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowPhotoScanner(true)}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Fotoğraftan
          </button>
          <ExcelImport logs={logs} onImport={onImport} />
        </div>
      </div>

      {/* Photo Scanner Modal */}
      {showPhotoScanner && (
        <PhotoScanner
          onDashboardData={(data) => {
            if (data.odometer) setCurrentOdometer(data.odometer.toString());
            if (data.consumption) setAvgConsumption(data.consumption.toString());
            if (data.distance) setDailyDistance(data.distance.toString());
          }}
          onReceiptData={(data) => {
            if (data.fuelPrice) setFuelPrice(data.fuelPrice.toString());
          }}
          onClose={() => setShowPhotoScanner(false)}
        />
      )}

      {/* Voice Entry Modal */}
      {showVoiceEntry && (
        <VoiceEntry
          onData={(data) => {
            if (data.distance) setDailyDistance(data.distance.toString());
            if (data.consumption) setAvgConsumption(data.consumption.toString());
            if (data.fuelPrice) setFuelPrice(data.fuelPrice.toString());
          }}
          onClose={() => setShowVoiceEntry(false)}
        />
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <label className={labelClasses}>Güncel KM</label>
          <div className="relative">
            <Gauge className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.1"
              required
              placeholder={`Örn: ${lastOdometer > 0 ? lastOdometer + 50 : 12500}`}
              value={currentOdometer}
              onChange={(e) => setCurrentOdometer(e.target.value)}
              className={`${inputBaseClasses} ${odoError ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {odoError && (
            <p className="text-xs text-red-500 mt-1 font-medium flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> {odoError}
            </p>
          )}
          {!odoError && lastOdometer > 0 && (
            <p className="text-xs text-gray-400 text-right mt-1">Son Kayıt: {lastOdometer.toLocaleString('tr-TR')} km</p>
          )}
        </div>

        <div>
          <label className={labelClasses}>Yapılan Kilometre</label>
          <div className="relative">
            <Calculator className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.1"
              required
              placeholder="0.0"
              value={dailyDistance}
              onChange={(e) => setDailyDistance(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Ort. Tüketim (L/100km)</label>
          <div className="relative">
            <Fuel className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.1"
              required
              placeholder="Örn: 6.5"
              value={avgConsumption}
              onChange={(e) => setAvgConsumption(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Yakıt Fiyatı (TL/L)</label>
          <div className="relative">
            <Coins className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            *Ortalama veya güncel pompa fiyatı
          </p>
        </div>

        <div>
          <label className={labelClasses}>İstasyon / Marka</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Shell', 'Opet', 'BP', 'Petrol Ofisi', 'Total', 'Aytemiz', 'Diğer'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setFuelStation(brand)}
                className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border ${fuelStation === brand
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105'
                  : 'bg-[#333333] dark:bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600'
                  }`}
              >
                {brand}
              </button>
            ))}
          </div>
          <div className="relative mt-2">
            <Fuel className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="İstasyon Adı (Opsiyonel)"
              value={fuelStation}
              onChange={(e) => setFuelStation(e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>

        {/* Dynamic Calculations Panel */}
        {liveStats && (
          <div className="bg-primary-50 dark:bg-gray-800 border border-primary-100 dark:border-primary-900 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-2">Tahmini Sonuçlar</h4>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">Günlük Tüketim</span>
                <span className="text-lg font-bold text-gray-800 dark:text-white">{liveStats.consumed} <span className="text-sm font-normal">L</span></span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 dark:text-gray-400 block">Günlük Maliyet</span>
                <span className="text-lg font-bold text-gray-800 dark:text-white">₺{liveStats.cost}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bu işlemde yakıt alındı mı?</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRefuelDay}
                onChange={(e) => {
                  setIsRefuelDay(e.target.checked);
                  if (e.target.checked) {
                    setShowPhotoScanner(true);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className={labelClasses}>Notlar (İsteğe Bağlı)</label>
          <div className="relative">
            <StickyNote className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <textarea
              rows={2}
              placeholder="Eklemek istediğiniz notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputBaseClasses} resize-none`}
            />
          </div>
        </div>

        {/* Location Toggle */}
        <div className="flex items-center justify-between border-gray-100 dark:border-gray-700 mb-4">
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
        {addLocation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 mb-4">
            {location ?
              `📍 ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` :
              "Konum alınıyor..."}
          </p>
        )}

        <div className="flex space-x-3 mt-6">
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
            className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
};