import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, MaintenanceItem, Vehicle, VehiclePart, FuelPurchase, VehicleDocument } from '../types';

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
  documents: VehicleDocument[];
  selectedVehicleId: string | null;

  // UI State
  activeTab: 'dashboard' | 'history' | 'reports' | 'maintenance' | 'settings';
  yearFilter: '2026' | '2025' | 'all';
  historySubTab: 'logs' | 'fuel';
  activeModal: 'entry' | 'fuel' | null;
  editingItem: any | null;

  // Settings State
  monthlyBudget: number;
  notificationsEnabled: boolean;
  lastNotificationCheck: string | null;
  autoSync: boolean;
  lastSyncTime: string | null;
  geminiApiKey: string | null;

  // Actions - Logs
  addLog: (log: DailyLog) => void;
  deleteLog: (id: string) => void;
  updateLog: (log: DailyLog) => void;
  importLogs: (logs: DailyLog[]) => void;
  clearLogs: () => void;
  repairFuelPrices: () => number;

  // Actions - Fuel Purchases
  addFuelPurchase: (purchase: FuelPurchase) => void;
  deleteFuelPurchase: (id: string) => void;
  updateFuelPurchase: (purchase: FuelPurchase) => void;

  // Actions - Maintenance
  addMaintenance: (item: MaintenanceItem) => void;
  deleteMaintenance: (id: string) => void;
  updateMaintenance: (id: string, lastKm: number, intervalKm?: number) => void;

  // Actions - Parts
  addPart: (part: VehiclePart) => void;
  deletePart: (id: string) => void;
  togglePart: (id: string) => void;

  // Actions - Vehicles
  setSelectedVehicleId: (id: string | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;

  // Actions - Documents
  addDocument: (doc: VehicleDocument) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (doc: VehicleDocument) => void;

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
      documents: [],
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

      clearLogs: () => set({ logs: [], maintenanceItems: [], fuelPurchases: [], vehicleParts: [] }),

      repairFuelPrices: () => {
        const { logs, fuelPurchases } = get();
        if (fuelPurchases.length === 0 || logs.length === 0) return 0;

        // Sort purchases by date ascending
        const sortedPurchases = [...fuelPurchases].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let updatedCount = 0;
        const repairedLogs = logs.map(log => {
          const logDate = new Date(log.date).getTime();
          // Find the most recent purchase on or before this log's date
          let matchedPrice: number | null = null;
          for (let i = sortedPurchases.length - 1; i >= 0; i--) {
            if (new Date(sortedPurchases[i].date).getTime() <= logDate) {
              matchedPrice = sortedPurchases[i].pricePerLiter;
              break;
            }
          }

          if (matchedPrice !== null && matchedPrice !== log.fuelPrice) {
            const dailyCost = log.dailyFuelConsumed * matchedPrice;
            const costPerKm = log.dailyDistance > 0 ? dailyCost / log.dailyDistance : 0;
            updatedCount++;
            return { ...log, fuelPrice: matchedPrice, dailyCost, costPerKm };
          }
          return log;
        });

        set({ logs: repairedLogs });
        return updatedCount;
      },

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


      // Document Actions
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter(d => d.id !== id)
      })),
      updateDocument: (doc) => set((state) => ({
        documents: state.documents.map(d => d.id === doc.id ? doc : d)
      })),

      // Hydration - first loads Zustand persist data, then merges legacy localStorage
      hydrate: async () => {
        try {
          // Step 1: Rehydrate from Zustand's persist storage
          await useAppStore.persist.rehydrate();
          console.log('[AppStore] Persist rehydrated. Logs:', get().logs.length);

          const state = get();

          // Merge logs - avoid duplicates by ID
          const savedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedLogs) {
            const legacyLogs = JSON.parse(savedLogs) as DailyLog[];
            const existingIds = new Set(state.logs.map(l => l.id));
            const newLogs = legacyLogs.filter(l => !existingIds.has(l.id));
            if (newLogs.length > 0) {
              set({ logs: [...state.logs, ...newLogs] });
            }
          }

          // Merge maintenance items
          const savedMaintenance = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
          if (savedMaintenance) {
            const legacyMaint = JSON.parse(savedMaintenance) as MaintenanceItem[];
            const existingIds = new Set(state.maintenanceItems.map(m => m.id));
            const newItems = legacyMaint.filter(m => !existingIds.has(m.id));
            if (newItems.length > 0) {
              set({ maintenanceItems: [...state.maintenanceItems, ...newItems] });
            }
          }

          // Set vehicles if current is default
          const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
          if (savedVehicles && state.vehicles.length <= 1 && state.vehicles[0]?.id === 'default') {
            const parsed = JSON.parse(savedVehicles) as Vehicle[];
            if (parsed.length > 0) {
              set({
                vehicles: parsed,
                selectedVehicleId: parsed[0].id
              });
            }
          }

          // Merge parts
          const savedParts = localStorage.getItem(PARTS_STORAGE_KEY);
          if (savedParts) {
            const legacyParts = JSON.parse(savedParts) as VehiclePart[];
            const existingIds = new Set(state.vehicleParts.map(p => p.id));
            const newParts = legacyParts.filter(p => !existingIds.has(p.id));
            if (newParts.length > 0) {
              set({ vehicleParts: [...state.vehicleParts, ...newParts] });
            }
          }

          // Merge fuel purchases
          const savedFuelPurchases = localStorage.getItem(FUEL_PURCHASES_STORAGE_KEY);
          if (savedFuelPurchases) {
            const legacyPurchases = JSON.parse(savedFuelPurchases) as FuelPurchase[];
            const existingIds = new Set(state.fuelPurchases.map(p => p.id));
            const newPurchases = legacyPurchases.filter(p => !existingIds.has(p.id));
            if (newPurchases.length > 0) {
              set({ fuelPurchases: [...state.fuelPurchases, ...newPurchases] });
            }
          }

          console.log('[AppStore] Hydration complete. Logs:', get().logs.length);
        } catch (e) {
          console.error('Failed to hydrate store', e);
        }
      }
    }),
    {
      name: 'yakit-takip-store',
      skipHydration: true, // Manual hydration for iOS Safari compatibility
      partialize: (state) => ({
        logs: state.logs,
        fuelPurchases: state.fuelPurchases,
        maintenanceItems: state.maintenanceItems,
        vehicles: state.vehicles,
        vehicleParts: state.vehicleParts,
        selectedVehicleId: state.selectedVehicleId,
        documents: state.documents, // Persist documents
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
