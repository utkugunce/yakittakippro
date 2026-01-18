import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog, MaintenanceItem, DashboardStats, Vehicle, VehiclePart } from './types';
import { EntryForm } from './EntryForm';
import { DashboardStatsCard } from './DashboardStatsCard';
import { LogHistory } from './LogHistory';
import { Charts } from './Charts';
import { Reports } from './Reports';
import { DataManagement } from './DataManagement';
import { Maintenance } from './Maintenance';
import { WeeklySummary } from './WeeklySummary';
import { NotificationSettings } from './NotificationSettings';

import { CloudSync } from './CloudSync';
import { FuelMap } from './FuelMap';
import { AIPredictions } from './AIPredictions';
import { ThemeSettings, AccentColor } from './ThemeSettings';
import { FuelPurchaseForm, FuelPurchase } from './FuelPurchaseForm';
import { FuelPurchaseHistory } from './FuelPurchaseHistory';
import { Car, LayoutDashboard, History, FileText, Moon, Sun, Settings, Wrench, Plus, X, Fuel } from 'lucide-react';
import { PwaReloadPrompt } from './PwaReloadPrompt';
import { SuccessPopup } from './SuccessPopup';



// New feature imports
import { BudgetTracker } from '@/src/features/budget';
import { StationAnalysis, CarbonFootprint } from '@/src/features/analytics';
import { ShareableStatsCard } from '@/src/features/sharing';

const LOCAL_STORAGE_KEY = 'yakit_takip_logs_v1';
const MAINTENANCE_STORAGE_KEY = 'yakit_takip_maintenance_v1';
const VEHICLES_STORAGE_KEY = 'yakit_takip_vehicles_v1';
const THEME_STORAGE_KEY = 'yakit_takip_theme_v1';
const FUEL_PURCHASES_STORAGE_KEY = 'yakit_takip_fuel_purchases_v1';

export default function App() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [vehicleParts, setVehicleParts] = useState<VehiclePart[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'reports' | 'maintenance' | 'settings'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');
  const [yearFilter, setYearFilter] = useState<'2026' | '2025' | 'all'>('all');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [showFuelPurchaseModal, setShowFuelPurchaseModal] = useState(false);
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([]);
  const [historySubTab, setHistorySubTab] = useState<'logs' | 'fuel'>('logs');
  const [editingFuelPurchase, setEditingFuelPurchase] = useState<FuelPurchase | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Default vehicle for backwards compatibility
  const defaultVehicle: Vehicle = {
    id: 'default',
    name: 'Aracım',
    fuelType: 'benzin',
    createdAt: new Date().toISOString()
  };

  // Load data from local storage
  useEffect(() => {
    const savedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }

    const savedMaintenance = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
    if (savedMaintenance) {
      try {
        setMaintenanceItems(JSON.parse(savedMaintenance));
      } catch (e) {
        console.error("Failed to parse maintenance items", e);
      }
    }

    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      try {
        const parsed = JSON.parse(savedVehicles);
        setVehicles(parsed.length > 0 ? parsed : [defaultVehicle]);
        setSelectedVehicleId(parsed.length > 0 ? parsed[0].id : 'default');
      } catch (e) {
        console.error("Failed to parse vehicles", e);
        setVehicles([defaultVehicle]);
        setSelectedVehicleId('default');
      }
    } else {
      setVehicles([defaultVehicle]);
      setSelectedVehicleId('default');
    }

    const savedParts = localStorage.getItem('yakit_takip_parts_v1');
    if (savedParts) {
      try {
        setVehicleParts(JSON.parse(savedParts));
      } catch (e) {
        console.error("Failed to parse parts", e);
      }
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedAccent = localStorage.getItem('yakit_takip_accent_v1') as AccentColor;
    if (savedAccent) {
      setAccentColor(savedAccent);
      document.documentElement.setAttribute('data-theme', savedAccent);
    }

    // Load fuel purchases
    const savedFuelPurchases = localStorage.getItem(FUEL_PURCHASES_STORAGE_KEY);
    if (savedFuelPurchases) {
      try {
        setFuelPurchases(JSON.parse(savedFuelPurchases));
      } catch (e) {
        console.error("Failed to parse fuel purchases", e);
      }
    }
  }, []);

  // Migrate existing data to gamification system


  // Save logs
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  // Save maintenance items
  useEffect(() => {
    localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(maintenanceItems));
  }, [maintenanceItems]);

  // Save parts
  useEffect(() => {
    localStorage.setItem('yakit_takip_parts_v1', JSON.stringify(vehicleParts));
  }, [vehicleParts]);

  // Save vehicles
  // Save fuel purchases
  useEffect(() => {
    localStorage.setItem(FUEL_PURCHASES_STORAGE_KEY, JSON.stringify(fuelPurchases));
  }, [fuelPurchases]);

  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }
  }, [vehicles]);

  // Filter logs by selected vehicle
  const filteredLogs = useMemo(() => {
    if (!selectedVehicleId || selectedVehicleId === 'all') return logs;
    return logs.filter(log => !log.vehicleId || log.vehicleId === selectedVehicleId);
  }, [logs, selectedVehicleId]);

  // Toggle Dark Mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddLog = (log: DailyLog) => {
    setLogs(prev => [log, ...prev]);
    setShowEntryModal(false);
    setShowSuccessPopup(true);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setShowEntryModal(true);
  };

  const handleUpdateLog = (updatedLog: DailyLog) => {
    setLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
    setEditingLog(null);
    setActiveTab('history');
  };

  const handleImportLogs = (importedLogs: DailyLog[]) => {
    setLogs(prev => {
      // Merge logs, avoid duplicates by ID if possible, or just append
      // For simplicity in this version, we will just add them and let user manage
      // But actually, DataManagement handles replacement or merge.
      // If DataManagement returns a full list, we use it.
      // But here we are waiting for a list of logs to ADD. 
      // Let's assume the component passes the NEW FULL LIST or we append.
      // The DataManagement component logic was: onImport(json). 
      // Let's check DataManagement: it parses JSON and calls onImport. 
      // Implementation plan said "Import" would replace or merge. 
      // Let's assume we append for now or replace if user cleared. 
      // Actually, let's just REPLACE for "Restore" functionality.
      return importedLogs;
    });
    alert('Veriler başarıyla yüklendi!');
  };

  const handleClearLogs = () => {
    setLogs([]);
    setMaintenanceItems([]);
  };

  const handleAddMaintenance = (item: MaintenanceItem) => {
    setMaintenanceItems(prev => [...prev, item]);
  };

  const handleDeleteMaintenance = (id: string) => {
    setMaintenanceItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateMaintenance = (id: string, lastKm: number) => {
    setMaintenanceItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          lastMaintenanceKm: lastKm,
          nextDueKm: lastKm + item.intervalKm
        };
      }
      return item;
    }));
  };

  // Fuel Purchase Handlers
  const handleDeleteFuelPurchase = (id: string) => {
    setFuelPurchases(prev => prev.filter(p => p.id !== id));
  };

  const handleEditFuelPurchase = (purchase: FuelPurchase) => {
    setEditingFuelPurchase(purchase);
    setShowFuelPurchaseModal(true);
  };

  const handleUpdateFuelPurchase = (updatedPurchase: FuelPurchase) => {
    setFuelPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
    setEditingFuelPurchase(null);
    setShowFuelPurchaseModal(false);
  };

  // Calculate stats based on year filter
  const stats: DashboardStats = useMemo(() => {
    const filteredLogs = yearFilter === 'all'
      ? logs
      : logs.filter(l => new Date(l.date).getFullYear().toString() === yearFilter);

    // Filter purchases by year if needed
    const filteredPurchases = yearFilter === 'all'
      ? fuelPurchases
      : fuelPurchases.filter(p => new Date(p.date).getFullYear().toString() === yearFilter);

    if (filteredLogs.length === 0 && filteredPurchases.length === 0) return { totalDistance: 0, totalCost: 0, avgCostPerKm: 0, avgConsumption: 0, lastFuelPrice: 0 };

    const totalDistance = filteredLogs.reduce((sum, log) => sum + log.dailyDistance, 0);
    const totalCost = filteredLogs.reduce((sum, log) => sum + log.dailyCost, 0);

    // Calculate average consumption (Logs only as they have distance)
    const validConsumptionLogs = filteredLogs.filter(l => l.avgConsumption > 0);
    const avgConsumption = validConsumptionLogs.length > 0
      ? validConsumptionLogs.reduce((sum, log) => sum + log.avgConsumption, 0) / validConsumptionLogs.length
      : 0;

    // Last fuel price (latest of Logs or Purchases)
    // Last fuel price (latest of Logs or Purchases - from ALL history)
    let lastFuelPrice = 0;

    const lastLogAll = logs.length > 0
      ? logs.reduce((prev, current) => new Date(prev.date) > new Date(current.date) ? prev : current)
      : null;

    const lastPurchaseAll = fuelPurchases.length > 0
      ? fuelPurchases.reduce((prev, current) => new Date(prev.date) > new Date(current.date) ? prev : current)
      : null;

    if (lastLogAll && lastPurchaseAll) {
      lastFuelPrice = new Date(lastPurchaseAll.date) > new Date(lastLogAll.date) ? lastPurchaseAll.pricePerLiter : lastLogAll.fuelPrice;
    } else if (lastLogAll) {
      lastFuelPrice = lastLogAll.fuelPrice;
    } else if (lastPurchaseAll) {
      lastFuelPrice = lastPurchaseAll.pricePerLiter;
    }

    return {
      totalDistance,
      totalCost,
      avgCostPerKm: totalDistance > 0 ? totalCost / totalDistance : 0,
      avgConsumption,
      lastFuelPrice
    };
  }, [logs, fuelPurchases, yearFilter]);

  const lastOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;

  const activeAlerts = useMemo(() => {
    const maintAlerts = maintenanceItems.filter(item => {
      let isDue = false;

      // 1. Check KM
      if (item.type === 'km' || item.type === 'both') {
        if (item.nextDueKm) {
          const remainingKm = item.nextDueKm - lastOdometer;
          if (remainingKm <= (item.notifyBeforeKm || 1000)) isDue = true;
        }
      }

      // 2. Check Date
      if (!isDue && (item.type === 'date' || item.type === 'both')) {
        if (item.dueDate) {
          const today = new Date();
          const due = new Date(item.dueDate);
          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= (item.notifyBeforeDays || 30)) isDue = true;
        }
      }

      return isDue;
    }).map(item => {
      // Calculate sorting urgency score (lower is more urgent)
      let urgency = 999999;
      let displayRemaining = "";

      if (item.type === 'date' && item.dueDate) {
        const days = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        urgency = days * 100; // rough heuristic: 1 day ~= 100km
        displayRemaining = `${days} gün`;
      } else if (item.nextDueKm) {
        urgency = item.nextDueKm - lastOdometer;
        displayRemaining = `${urgency} km`;
      }

      return { ...item, urgency, displayRemaining };
    });

    const partAlerts = vehicleParts.filter(part => {
      if (!part.lifespanKm || !part.isActive) return false;
      const dueKm = part.installKm + part.lifespanKm;
      return (dueKm - lastOdometer) <= 1000;
    }).map(part => {
      const remaining = (part.installKm + part.lifespanKm!) - lastOdometer;
      return {
        id: part.id,
        title: `${part.name} (Parça)`,
        type: 'km',
        nextDueKm: part.installKm + part.lifespanKm!,
        notifyBeforeKm: 1000,
        status: 'warning',
        urgency: remaining,
        displayRemaining: `${remaining} km`
      } as MaintenanceItem & { urgency: number, displayRemaining: string };
    });

    return [...maintAlerts, ...partAlerts].sort((a, b) => a.urgency - b.urgency);
  }, [maintenanceItems, vehicleParts, lastOdometer]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">TripBook</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yolculuk Günlüğünüz</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Vehicle Selector */}
            {vehicles.length > 1 && (
              <select
                value={selectedVehicleId || ''}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                title="Araç Seçimi"
                aria-label="Araç Seçimi"
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-6 w-full space-y-6 pb-24 md:pb-6">

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex p-1 space-x-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'dashboard'
              ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span>Panel & Giriş</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'history'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <History className="w-4 h-4 mr-2" />
            Geçmiş
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'maintenance'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Bakım
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'reports'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Raporlar
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Year Filter Tabs - En Üst */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                {(['2026', '2025', 'all'] as const).map((year) => (
                  <button
                    key={year}
                    onClick={() => setYearFilter(year)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${yearFilter === year
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {year === 'all' ? 'Hepsi' : year}
                  </button>
                ))}
              </div>
            </div>

            <DashboardStatsCard stats={stats} alerts={activeAlerts} currentOdometer={lastOdometer} />

            {/* Weekly/Monthly Summary */}
            <WeeklySummary logs={logs} fuelPurchases={fuelPurchases} />

            {/* Analytics Section */}
            {/* Budget Tracker */}
            <BudgetTracker fuelPurchases={fuelPurchases} />

            {/* Shareable Stats Card */}
            <ShareableStatsCard
              stats={{
                totalDistance: stats.totalDistance,
                totalCost: stats.totalCost,
                avgConsumption: stats.avgConsumption,
                totalFuelPurchases: fuelPurchases.length
              }}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-500 space-y-4">
            {/* History Sub-Tab Switcher */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setHistorySubTab('logs')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center space-x-2 ${historySubTab === 'logs'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <History className="w-4 h-4" />
                  <span>Günlük Kayıtlar</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">{logs.length}</span>
                </button>
                <button
                  onClick={() => setHistorySubTab('fuel')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center space-x-2 ${historySubTab === 'fuel'
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <Fuel className="w-4 h-4" />
                  <span>Yakıt Alımları</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs px-1.5 py-0.5 rounded-full">{fuelPurchases.length}</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {historySubTab === 'logs' && (
              <LogHistory logs={logs} onDelete={handleDeleteLog} onEdit={handleEditLog} />
            )}
            {historySubTab === 'fuel' && (
              <FuelPurchaseHistory
                purchases={fuelPurchases}
                onDelete={handleDeleteFuelPurchase}
                onEdit={handleEditFuelPurchase}
              />
            )}
          </div>
        )
        }

        {
          activeTab === 'reports' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <FuelMap logs={logs} purchases={fuelPurchases} />
              <Reports
                logs={logs}
                purchases={fuelPurchases}
                maintenanceItems={maintenanceItems}
                vehicleParts={vehicleParts}
              />
            </div>
          )
        }

        {
          activeTab === 'maintenance' && (
            <div className="animate-in fade-in duration-500">
              <Maintenance
                items={maintenanceItems}
                parts={vehicleParts}
                currentOdometer={lastOdometer}
                onAdd={handleAddMaintenance}
                onDelete={handleDeleteMaintenance}
                onUpdate={handleUpdateMaintenance}
                onAddPart={(part) => setVehicleParts(prev => [...prev, part])}
                onDeletePart={(id) => setVehicleParts(prev => prev.filter(p => p.id !== id))}
                onTogglePart={(id) => setVehicleParts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))}
              />
            </div>
          )
        }

        {
          activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <ThemeSettings
                isDarkMode={isDarkMode}
                onToggleTheme={() => {
                  const newMode = !isDarkMode;
                  setIsDarkMode(newMode);
                  if (newMode) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem(THEME_STORAGE_KEY, 'light');
                  }
                }}
                currentAccent={accentColor}
                onChangeAccent={(color) => {
                  setAccentColor(color);
                  localStorage.setItem('yakit_takip_accent_v1', color);
                  document.documentElement.setAttribute('data-theme', color);
                }}
              />
              <CloudSync
                logs={logs}
                maintenanceItems={maintenanceItems}
                vehicles={vehicles}
                onImportLogs={(imported) => {
                  setLogs(prev => {
                    // Merge new logs with existing ones, avoiding duplicates by ID
                    const existingIds = new Set(prev.map(p => p.id));
                    const newLogs = imported.filter(l => !existingIds.has(l.id));
                    return [...prev, ...newLogs];
                  });
                }}
                onImportMaintenance={(imported) => setMaintenanceItems(imported)}
                onImportVehicles={(imported) => setVehicles(imported)}
              />
              <NotificationSettings maintenanceItems={maintenanceItems} currentOdometer={lastOdometer} />
              <DataManagement logs={logs} onImport={handleImportLogs} onClear={handleClearLogs} />
            </div>
          )
        }

      </main >

      {/* Mobile Bottom Navigation */}
      < div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 z-50" >
        <div className="flex items-center justify-around">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <LayoutDashboard className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Panel</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'history' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Geçmiş</span>
          </button>
          <button onClick={() => setActiveTab('maintenance')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'maintenance' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Wrench className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Bakım</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'reports' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Rapor</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Ayarlar</span>
          </button>
        </div>
      </div >

      {/* Floating Action Buttons */}
      < div className="fixed bottom-24 md:bottom-8 right-6 flex flex-col space-y-3 z-40" >
        {/* Fuel Purchase Button */}
        < button
          onClick={() => setShowFuelPurchaseModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Yakıt Alımı"
        >
          <Fuel className="w-7 h-7" />
        </button >
        {/* Daily Entry Button */}
        < button
          onClick={() => setShowEntryModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Yeni Kayıt Ekle"
        >
          <Plus className="w-7 h-7" />
        </button >
      </div >

      {/* Entry Form Modal */}
      {
        showEntryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {editingLog ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
                </h2>
                <button onClick={() => { setShowEntryModal(false); setEditingLog(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" title="Kapat" aria-label="Kapat">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <EntryForm
                  logs={logs}
                  onAdd={(log) => {
                    handleAddLog(log);
                    setShowEntryModal(false);
                  }}
                  onUpdate={(log) => {
                    handleUpdateLog(log);
                    setShowEntryModal(false);
                  }}
                  onImport={handleImportLogs}
                  lastOdometer={lastOdometer}
                  lastFuelPrice={stats.lastFuelPrice}
                  editingLog={editingLog}
                />
              </div>
            </div>
          </div>
        )
      }

      {/* Fuel Purchase Modal */}
      {
        showFuelPurchaseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {editingFuelPurchase ? 'Yakıt Alımını Düzenle' : 'Yakıt Alımı'}
                  </h2>
                </div>
                <button onClick={() => { setShowFuelPurchaseModal(false); setEditingFuelPurchase(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" title="Kapat" aria-label="Kapat">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <FuelPurchaseForm
                  onAdd={(purchase) => {
                    setFuelPurchases(prev => [purchase, ...prev]);
                    setShowFuelPurchaseModal(false);
                    setEditingFuelPurchase(null);
                  }}
                  onUpdate={handleUpdateFuelPurchase}
                  editingPurchase={editingFuelPurchase}
                  lastOdometer={lastOdometer}
                  lastFuelPrice={stats.lastFuelPrice}
                />
              </div>
            </div>
          </div>
        )
      }

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        logs={logs}
      />

      <PwaReloadPrompt />
    </div >
  );
}