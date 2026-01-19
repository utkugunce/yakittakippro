import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, MaintenanceItem, Vehicle, VehiclePart, FuelPurchase } from '../types';

const LOCAL_STORAGE_KEY = 'yakit_takip_logs_v1';
const MAINTENANCE_STORAGE_KEY = 'yakit_takip_maintenance_v1';
const VEHICLES_STORAGE_KEY = 'yakit_takip_vehicles_v1';
const PARTS_STORAGE_KEY = 'yakit_takip_parts_v1';
const FUEL_PURCHASES_STORAGE_KEY = 'yakit_takip_fuel_purchases_v1';

interface AppState {
  // Data
  logs: DailyLog[];
  fuelPurchases: FuelPurchase[];
  maintenanceItems: MaintenanceItem[];
  vehicles: Vehicle[];
  vehicleParts: VehiclePart[];
  selectedVehicleId: string | null;

  // UI State
  activeTab: 'dashboard' | 'history' | 'reports' | 'maintenance' | 'settings';
  yearFilter: '2026' | '2025' | 'all';
  historySubTab: 'logs' | 'fuel';
  activeModal: 'entry' | 'fuel' | null;
  editingItem: any | null; // Generic for log or fuel purchase being edited

  // Actions - UI
  setActiveTab: (tab: AppState['activeTab']) => void;
  setYearFilter: (filter: AppState['yearFilter']) => void;
  setHistorySubTab: (tab: AppState['historySubTab']) => void;
  openModal: (modal: 'entry' | 'fuel', item?: any) => void;
  closeModal: () => void;

  // Actions - Settings
  setMonthlyBudget: (budget: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLastNotificationCheck: (date: string | null) => void;
  setAutoSync: (enabled: boolean) => void;
  setLastSyncTime: (date: string | null) => void;
  setGeminiApiKey: (key: string | null) => void;

  // Hydration
  hydrate: () => void;
}

const defaultVehicle: Vehicle = {
  id: 'default',
  name: 'Aracım',
  fuelType: 'benzin',
  createdAt: new Date().toISOString()
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      logs: [],
      fuelPurchases: [],
      maintenanceItems: [],
      vehicles: [defaultVehicle],
      vehicleParts: [],
      selectedVehicleId: 'default',
      activeTab: 'dashboard',
      yearFilter: 'all',
      historySubTab: 'logs',
      activeModal: null,
      editingItem: null,

      // Initial Settings (Migration from separate localStorage keys)
      monthlyBudget: parseFloat(localStorage.getItem('monthly_budget') || '0'),
      notificationsEnabled: localStorage.getItem('notifications_enabled') === 'true',
      lastNotificationCheck: localStorage.getItem('last_notification_check'),
      autoSync: localStorage.getItem('auto_sync') === 'true',
      lastSyncTime: localStorage.getItem('last_sync_time'),
      geminiApiKey: localStorage.getItem('gemini_api_key'),

      // Log Actions
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
      deleteLog: (id) => set((state) => ({ logs: state.logs.filter(l => l.id !== id) })),
      updateLog: (log) => set((state) => ({
        logs: state.logs.map(l => l.id === log.id ? log : l)
      })),
      importLogs: (logs) => set({ logs }),
      clearLogs: () => set({ logs: [], maintenanceItems: [] }),

      // Fuel Purchase Actions
      addFuelPurchase: (purchase) => set((state) => ({
        fuelPurchases: [purchase, ...state.fuelPurchases]
      })),
      deleteFuelPurchase: (id) => set((state) => ({
        fuelPurchases: state.fuelPurchases.filter(p => p.id !== id)
      })),
      updateFuelPurchase: (purchase) => set((state) => ({
        fuelPurchases: state.fuelPurchases.map(p => p.id === purchase.id ? purchase : p)
      })),

      // Maintenance Actions
      addMaintenance: (item) => set((state) => ({
        maintenanceItems: [...state.maintenanceItems, item]
      })),
      deleteMaintenance: (id) => set((state) => ({
        maintenanceItems: state.maintenanceItems.filter(i => i.id !== id)
      })),
      updateMaintenance: (id, lastKm, intervalKm) => set((state) => ({
        maintenanceItems: state.maintenanceItems.map(item => {
          if (item.id === id) {
            return {
              ...item,
              lastMaintenanceKm: lastKm,
              nextDueKm: lastKm + (intervalKm ?? item.intervalKm ?? 0)
            };
          }
          return item;
        })
      })),

      // Part Actions
      addPart: (part) => set((state) => ({ vehicleParts: [...state.vehicleParts, part] })),
      deletePart: (id) => set((state) => ({
        vehicleParts: state.vehicleParts.filter(p => p.id !== id)
      })),
      togglePart: (id) => set((state) => ({
        vehicleParts: state.vehicleParts.map(p =>
          p.id === id ? { ...p, isActive: !p.isActive } : p
        )
      })),

      // Vehicle Actions
      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
      setVehicles: (vehicles) => set({ vehicles }),

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setYearFilter: (filter) => set({ yearFilter: filter }),
      setHistorySubTab: (tab) => set({ historySubTab: tab }),
      openModal: (modal, item) => set({ activeModal: modal, editingItem: item || null }),
      closeModal: () => set({ activeModal: null, editingItem: null }),

      // Settings Actions
      setMonthlyBudget: (budget) => set({ monthlyBudget: budget }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setLastNotificationCheck: (date) => set({ lastNotificationCheck: date }),
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setLastSyncTime: (date) => set({ lastSyncTime: date }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),

      // Hydration from legacy localStorage
      hydrate: () => {
        try {
          const savedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedLogs) set({ logs: JSON.parse(savedLogs) });

          const savedMaintenance = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
          if (savedMaintenance) set({ maintenanceItems: JSON.parse(savedMaintenance) });

          const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
          if (savedVehicles) {
            const parsed = JSON.parse(savedVehicles);
            set({
              vehicles: parsed.length > 0 ? parsed : [defaultVehicle],
              selectedVehicleId: parsed.length > 0 ? parsed[0].id : 'default'
            });
          }

          const savedParts = localStorage.getItem(PARTS_STORAGE_KEY);
          if (savedParts) set({ vehicleParts: JSON.parse(savedParts) });

          const savedFuelPurchases = localStorage.getItem(FUEL_PURCHASES_STORAGE_KEY);
          if (savedFuelPurchases) set({ fuelPurchases: JSON.parse(savedFuelPurchases) });
        } catch (e) {
          console.error('Failed to hydrate store', e);
        }
      }
    }),
    {
      name: 'yakit-takip-store',
      partialize: (state) => ({
        logs: state.logs,
        fuelPurchases: state.fuelPurchases,
        maintenanceItems: state.maintenanceItems,
        vehicles: state.vehicles,
        vehicleParts: state.vehicleParts,
        selectedVehicleId: state.selectedVehicleId,
        monthlyBudget: state.monthlyBudget,
        notificationsEnabled: state.notificationsEnabled,
        lastNotificationCheck: state.lastNotificationCheck,
        autoSync: state.autoSync,
        lastSyncTime: state.lastSyncTime,
        geminiApiKey: state.geminiApiKey,
      }),
    }
  )
);
