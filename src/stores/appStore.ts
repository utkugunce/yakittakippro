import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DailyLog, MaintenanceItem, Vehicle, VehiclePart, FuelPurchase, VehicleDocument,
  ChargeSession, Expense, ServiceRecord, FuelPriceEntry, Trip
} from '../types';
import { saveToCloud, isSupabaseConfigured } from '../lib/supabase';
import { STORAGE_KEYS, getString, getJSON } from '../lib/storage';

const LOCAL_STORAGE_KEY = STORAGE_KEYS.logs;
const MAINTENANCE_STORAGE_KEY = STORAGE_KEYS.maintenance;
const VEHICLES_STORAGE_KEY = STORAGE_KEYS.vehicles;
const PARTS_STORAGE_KEY = STORAGE_KEYS.parts;
const FUEL_PURCHASES_STORAGE_KEY = STORAGE_KEYS.fuelPurchases;

// Bump when the persisted shape changes; pair with a `migrate` step below.
const PERSIST_VERSION = 1;

interface AppState {
  // Data
  logs: DailyLog[];
  fuelPurchases: FuelPurchase[];
  maintenanceItems: MaintenanceItem[];
  vehicles: Vehicle[];
  vehicleParts: VehiclePart[];
  documents: VehicleDocument[];
  chargeSessions: ChargeSession[];
  expenses: Expense[];
  serviceRecords: ServiceRecord[];
  fuelPrices: FuelPriceEntry[];
  trips: Trip[];
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

  // Actions - Charge Sessions (electric/hybrid)
  addChargeSession: (session: ChargeSession) => void;
  deleteChargeSession: (id: string) => void;
  updateChargeSession: (session: ChargeSession) => void;

  // Actions - Expenses (TCO)
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;

  // Actions - Service Records
  addServiceRecord: (record: ServiceRecord) => void;
  deleteServiceRecord: (id: string) => void;
  updateServiceRecord: (record: ServiceRecord) => void;

  // Actions - Fuel Prices
  addFuelPrice: (entry: FuelPriceEntry) => void;
  deleteFuelPrice: (id: string) => void;

  // Actions - Trips
  addTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  updateTrip: (trip: Trip) => void;

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

  // Hydration & Sync
  hydrate: () => void;
  triggerSync: () => Promise<void>;
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
      chargeSessions: [],
      expenses: [],
      serviceRecords: [],
      fuelPrices: [],
      trips: [],
      selectedVehicleId: 'default',
      activeTab: 'dashboard',
      yearFilter: 'all',
      historySubTab: 'logs',
      activeModal: null,
      editingItem: null,

      // Initial Settings (Migration from separate localStorage keys)
      monthlyBudget: parseFloat(getString('monthly_budget') || '0'),
      notificationsEnabled: getString('notifications_enabled') === 'true',
      lastNotificationCheck: getString('last_notification_check'),
      autoSync: getString('auto_sync') === 'true',
      lastSyncTime: getString('last_sync_time'),
      geminiApiKey: getString('gemini_api_key'),

      // Helper to trigger background sync if autoSync is enabled
      triggerSync: async () => {
        const state = get();
        if (state.autoSync && isSupabaseConfigured()) {
          const result = await saveToCloud({
            logs: state.logs,
            maintenanceItems: state.maintenanceItems,
            vehicles: state.vehicles,
            monthlyBudget: state.monthlyBudget
          });
          if (result.success) {
            set({ lastSyncTime: new Date().toLocaleString('tr-TR') });
          }
        }
      },

      // Log Actions
      addLog: (log) => {
        set((state) => ({ logs: [log, ...state.logs] }));
        get().triggerSync();
      },
      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter(l => l.id !== id) }));
        get().triggerSync();
      },
      updateLog: (log) => {
        set((state) => ({
          logs: state.logs.map(l => l.id === log.id ? log : l)
        }));
        get().triggerSync();
      },
      importLogs: (logs) => {
        set({ logs });
        get().triggerSync();
      },

      clearLogs: () => {
        set({
          logs: [], maintenanceItems: [], fuelPurchases: [], vehicleParts: [],
          chargeSessions: [], expenses: [], serviceRecords: [], fuelPrices: [], trips: []
        });
        get().triggerSync();
      },

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
      addFuelPurchase: (purchase) => {
        set((state) => ({ fuelPurchases: [purchase, ...state.fuelPurchases] }));
        get().triggerSync();
      },
      deleteFuelPurchase: (id) => {
        set((state) => ({ fuelPurchases: state.fuelPurchases.filter(p => p.id !== id) }));
        get().triggerSync();
      },
      updateFuelPurchase: (purchase) => {
        set((state) => ({ fuelPurchases: state.fuelPurchases.map(p => p.id === purchase.id ? purchase : p) }));
        get().triggerSync();
      },

      // Maintenance Actions
      addMaintenance: (item) => {
        set((state) => ({ maintenanceItems: [...state.maintenanceItems, item] }));
        get().triggerSync();
      },
      deleteMaintenance: (id) => {
        set((state) => ({ maintenanceItems: state.maintenanceItems.filter(i => i.id !== id) }));
        get().triggerSync();
      },
      updateMaintenance: (id, lastKm, intervalKm) => {
        set((state) => ({
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
        }));
        get().triggerSync();
      },

      // Part Actions
      addPart: (part) => {
        set((state) => ({ vehicleParts: [...state.vehicleParts, part] }));
        get().triggerSync();
      },
      deletePart: (id) => {
        set((state) => ({ vehicleParts: state.vehicleParts.filter(p => p.id !== id) }));
        get().triggerSync();
      },
      togglePart: (id) => {
        set((state) => ({
          vehicleParts: state.vehicleParts.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          )
        }));
        get().triggerSync();
      },

      // Vehicle Actions
      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
      setVehicles: (vehicles) => {
        set({ vehicles });
        get().triggerSync();
      },

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setYearFilter: (filter) => set({ yearFilter: filter }),
      setHistorySubTab: (tab) => set({ historySubTab: tab }),
      openModal: (modal, item) => set({ activeModal: modal, editingItem: item || null }),
      closeModal: () => set({ activeModal: null, editingItem: null }),

      // Settings Actions
      setMonthlyBudget: (budget) => {
        set({ monthlyBudget: budget });
        get().triggerSync();
      },
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setLastNotificationCheck: (date) => set({ lastNotificationCheck: date }),
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setLastSyncTime: (date) => set({ lastSyncTime: date }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),


      // Document Actions
      addDocument: (doc) => {
        set((state) => ({ documents: [...state.documents, doc] }));
        get().triggerSync();
      },
      deleteDocument: (id) => {
        set((state) => ({ documents: state.documents.filter(d => d.id !== id) }));
        get().triggerSync();
      },
      updateDocument: (doc) => {
        set((state) => ({ documents: state.documents.map(d => d.id === doc.id ? doc : d) }));
        get().triggerSync();
      },

      // Charge Session Actions
      addChargeSession: (session) => {
        set((state) => ({ chargeSessions: [session, ...state.chargeSessions] }));
        get().triggerSync();
      },
      deleteChargeSession: (id) => {
        set((state) => ({ chargeSessions: state.chargeSessions.filter(c => c.id !== id) }));
        get().triggerSync();
      },
      updateChargeSession: (session) => {
        set((state) => ({ chargeSessions: state.chargeSessions.map(c => c.id === session.id ? session : c) }));
        get().triggerSync();
      },

      // Expense Actions
      addExpense: (expense) => {
        set((state) => ({ expenses: [expense, ...state.expenses] }));
        get().triggerSync();
      },
      deleteExpense: (id) => {
        set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }));
        get().triggerSync();
      },
      updateExpense: (expense) => {
        set((state) => ({ expenses: state.expenses.map(e => e.id === expense.id ? expense : e) }));
        get().triggerSync();
      },

      // Service Record Actions
      addServiceRecord: (record) => {
        set((state) => ({ serviceRecords: [record, ...state.serviceRecords] }));
        get().triggerSync();
      },
      deleteServiceRecord: (id) => {
        set((state) => ({ serviceRecords: state.serviceRecords.filter(r => r.id !== id) }));
        get().triggerSync();
      },
      updateServiceRecord: (record) => {
        set((state) => ({ serviceRecords: state.serviceRecords.map(r => r.id === record.id ? record : r) }));
        get().triggerSync();
      },

      // Fuel Price Actions
      addFuelPrice: (entry) => {
        set((state) => ({ fuelPrices: [entry, ...state.fuelPrices] }));
        get().triggerSync();
      },
      deleteFuelPrice: (id) => {
        set((state) => ({ fuelPrices: state.fuelPrices.filter(p => p.id !== id) }));
        get().triggerSync();
      },

      // Trip Actions
      addTrip: (trip) => {
        set((state) => ({ trips: [trip, ...state.trips] }));
        get().triggerSync();
      },
      deleteTrip: (id) => {
        set((state) => ({ trips: state.trips.filter(t => t.id !== id) }));
        get().triggerSync();
      },
      updateTrip: (trip) => {
        set((state) => ({ trips: state.trips.map(t => t.id === trip.id ? trip : t) }));
        get().triggerSync();
      },

      // Hydration - first loads Zustand persist data, then merges legacy localStorage
      hydrate: async () => {
        try {
          // Step 1: Rehydrate from Zustand's persist storage
          await useAppStore.persist.rehydrate();
          console.log('[AppStore] Persist rehydrated. Logs:', get().logs.length);

          const state = get();

          // Merge logs - avoid duplicates by ID. getJSON returns the fallback
          // (null) when the legacy key is missing or holds corrupted data, so a
          // single bad key can no longer abort the whole migration.
          const legacyLogs = getJSON<DailyLog[] | null>(LOCAL_STORAGE_KEY, null);
          if (legacyLogs && Array.isArray(legacyLogs)) {
            const safeLogs = state.logs || [];
            const existingIds = new Set(safeLogs.map(l => l.id));
            const newLogs = legacyLogs.filter(l => !existingIds.has(l.id));
            if (newLogs.length > 0) {
              set({ logs: [...safeLogs, ...newLogs] });
            }
          }

          // Merge maintenance items
          const legacyMaint = getJSON<MaintenanceItem[] | null>(MAINTENANCE_STORAGE_KEY, null);
          if (legacyMaint && Array.isArray(legacyMaint)) {
            const safeMaint = state.maintenanceItems || [];
            const existingIds = new Set(safeMaint.map(m => m.id));
            const newItems = legacyMaint.filter(m => !existingIds.has(m.id));
            if (newItems.length > 0) {
              set({ maintenanceItems: [...safeMaint, ...newItems] });
            }
          }

          // Set vehicles if current is default
          const safeVehicles = state.vehicles || [];
          const legacyVehicles = getJSON<Vehicle[] | null>(VEHICLES_STORAGE_KEY, null);
          if (
            legacyVehicles &&
            Array.isArray(legacyVehicles) &&
            legacyVehicles.length > 0 &&
            safeVehicles.length <= 1 &&
            safeVehicles[0]?.id === 'default'
          ) {
            set({
              vehicles: legacyVehicles,
              selectedVehicleId: legacyVehicles[0].id
            });
          }

          // Merge parts
          const legacyParts = getJSON<VehiclePart[] | null>(PARTS_STORAGE_KEY, null);
          if (legacyParts && Array.isArray(legacyParts)) {
            const safeParts = state.vehicleParts || [];
            const existingIds = new Set(safeParts.map(p => p.id));
            const newParts = legacyParts.filter(p => !existingIds.has(p.id));
            if (newParts.length > 0) {
              set({ vehicleParts: [...safeParts, ...newParts] });
            }
          }

          // Merge fuel purchases
          const legacyPurchases = getJSON<FuelPurchase[] | null>(FUEL_PURCHASES_STORAGE_KEY, null);
          if (legacyPurchases && Array.isArray(legacyPurchases)) {
            const safePurchases = state.fuelPurchases || [];
            const existingIds = new Set(safePurchases.map(p => p.id));
            const newPurchases = legacyPurchases.filter(p => !existingIds.has(p.id));
            if (newPurchases.length > 0) {
              set({ fuelPurchases: [...safePurchases, ...newPurchases] });
            }
          }

          console.log('[AppStore] Hydration complete. Logs:', get().logs.length);
        } catch (e) {
          console.error('Failed to hydrate store', e);
        }
      }
    }),
    {
      name: STORAGE_KEYS.store,
      version: PERSIST_VERSION,
      skipHydration: true, // Manual hydration for iOS Safari compatibility
      // Runs when the persisted version is older than PERSIST_VERSION. Returning
      // the state as-is is safe for v0 -> v1 (no shape change yet); future shape
      // changes should transform `persisted` here instead of risking data loss.
      migrate: (persisted) => persisted as AppState,
      partialize: (state) => ({
        logs: state.logs,
        fuelPurchases: state.fuelPurchases,
        maintenanceItems: state.maintenanceItems,
        vehicles: state.vehicles,
        vehicleParts: state.vehicleParts,
        selectedVehicleId: state.selectedVehicleId,
        documents: state.documents, // Persist documents
        chargeSessions: state.chargeSessions,
        expenses: state.expenses,
        serviceRecords: state.serviceRecords,
        fuelPrices: state.fuelPrices,
        trips: state.trips,
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
