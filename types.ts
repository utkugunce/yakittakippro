export interface DailyLog {
  id: string;
  date: string;
  currentOdometer: number; // Güncel KM
  dailyDistance: number;   // O gün yapılan KM
  avgConsumption: number;  // Ortalama Tüketim (L/100km)
  isRefuelDay: boolean;    // Yakıt alındı mı?
  fuelPrice: number;       // Benzin Fiyatı (TL/L)
  notes?: string;          // Kullanıcı notları

  // Calculated fields (stored for easier history, though could be computed)
  dailyFuelConsumed: number; // Günlük Yakıt (L)
  dailyCost: number;         // Günlük Yakıt Harcaması (TL)
  costPerKm: number;         // KM Başına Maliyet (TL/km)
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
  intervalKm: number;    // Kaç km'de bir yapılmalı (örn: 10000)
  lastMaintenanceKm: number; // En son kaç km'de yapıldı
  notifyBeforeKm: number; // Kaç km kala uyar (örn: 1000)
  nextDueKm: number; // Hesaplanmış sonraki bakım km'si
  status: 'ok' | 'warning' | 'critical'; // Durum
}