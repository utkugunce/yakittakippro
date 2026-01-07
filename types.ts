export interface DailyLog {
  id: string;
  vehicleId?: string;        // Araç ID (çoklu araç desteği)
  date: string;
  currentOdometer: number; // Güncel KM
  dailyDistance: number;   // O gün yapılan KM
  avgConsumption: number;  // Ortalama Tüketim (L/100km)
  isRefuelDay: boolean;    // Yakıt alındı mı?
  fuelPrice: number;       // Benzin Fiyatı (TL/L)
  fuelStation?: string;    // Yakıt İstasyonu / Marka (Shell, Opet vb.)
  notes?: string;          // Kullanıcı notları

  // Location Data
  latitude?: number;
  longitude?: number;
  locationName?: string;

  // Calculated fields (stored for easier history, though could be computed)
  dailyFuelConsumed: number; // Günlük Yakıt (L)
  dailyCost: number;         // Günlük Yakıt Harcaması (TL)
  costPerKm: number;         // KM Başına Maliyet (TL/km)
}

export interface Vehicle {
  id: string;
  name: string;              // Araç adı (örn: "Aile Arabası")
  plate?: string;            // Plaka
  fuelType: 'benzin' | 'dizel' | 'lpg' | 'elektrik' | 'hibrit';
  color?: string;            // Renk (UI için)
  icon?: string;             // İkon (car, truck, motorcycle vb.)
  createdAt: string;
}

export interface DashboardStats {
  totalDistance: number;
  totalCost: number;
  avgCostPerKm: number;
  avgConsumption: number;  // Ortalama Yakıt Tüketimi (L/100km)
  lastFuelPrice: number;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  type?: 'km' | 'date' | 'both';  // Bakım türü
  // KM-based tracking
  intervalKm?: number;    // Kaç km'de bir yapılmalı (örn: 10000)
  lastMaintenanceKm?: number; // En son kaç km'de yapıldı
  notifyBeforeKm?: number; // Kaç km kala uyar (örn: 1000)
  nextDueKm?: number; // Hesaplanmış sonraki bakım km'si
  // Date-based tracking (muayene, sigorta vb.)
  dueDate?: string;       // Son tarih (ISO string)
  notifyBeforeDays?: number; // Kaç gün kala uyar (örn: 30)
  // Common
  status: 'ok' | 'warning' | 'critical'; // Durum
}

export type PartType = 'tire' | 'battery' | 'pad' | 'wiper' | 'other';

export interface VehiclePart {
  id: string;
  type: PartType;
  name: string;
  installDate: string;
  installKm: number;
  lifespanKm?: number; // Expected lifespan
  isActive: boolean;
  notes?: string;
}