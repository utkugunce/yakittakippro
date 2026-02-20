import React, { useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { DashboardStats, AccentColor } from './types';
import { EntryForm } from './features/fuel/components/EntryForm';
import { FuelPurchaseForm } from './features/fuel/components/FuelPurchaseForm';
import { AppLayout } from './components/layout/AppLayout';
import { PwaReloadPrompt } from './components/pwa/PwaReloadPrompt';
import { SuccessPopup } from './components/ui/SuccessPopup';
import { BottomSheetModal } from './components/ui/BottomSheetModal';
import { PageLoader } from './components/PageLoader';
import { useAppStore } from './stores/appStore';

// Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { HistoryPage } from './features/history/HistoryPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { Maintenance } from './features/maintenance/MaintenancePage';

// Lazy Loaded Pages
const ChartsPage = React.lazy(() => import('./features/charts/ChartsPage').then(module => ({ default: module.ChartsPage })));
const Reports = React.lazy(() => import('./features/analytics/ReportsPage').then(module => ({ default: module.Reports })));
const FuelMap = React.lazy(() => import('./features/fuel/components/FuelMap').then(module => ({ default: module.FuelMap })));
const Glovebox = React.lazy(() => import('./features/glovebox/GloveboxPage').then(module => ({ default: module.GloveboxPage })));
const RoutePlanner = React.lazy(() => import('./features/maps/RoutePlannerPage').then(module => ({ default: module.RoutePlannerPage })));

const THEME_STORAGE_KEY = 'yakit_takip_theme_v1';

export default function App() {
  const navigate = useNavigate();
  const {
    logs, vehicles, selectedVehicleId, activeModal, editingItem,
    addLog, updateLog, importLogs,
    addFuelPurchase, updateFuelPurchase,
    setSelectedVehicleId, openModal, closeModal, hydrate
  } = useAppStore();

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [accentColor, setAccentColor] = React.useState<AccentColor>('blue');
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);

  // Initial Hydration
  useEffect(() => {
    hydrate();

    // Gamification Check
    import('./features/gamification/store/gamificationStore').then(({ useGamificationStore }) => {
      useGamificationStore.getState().updateStreak();
    });

    // Theme initialization
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle Dark Mode (Local UI state, separate from data store)
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Derived state for legacy prop passing
  const lastOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;
  const lastFuelPrice = logs.length > 0
    ? logs.reduce((prev, curr) => new Date(prev.date) > new Date(curr.date) ? prev : curr).fuelPrice
    : 0;

  return (
    <AppLayout
      vehicles={vehicles}
      selectedVehicleId={selectedVehicleId}
      onSelectVehicle={setSelectedVehicleId}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      onOpenEntryModal={() => openModal('entry')}
      onOpenFuelModal={() => openModal('fuel')}
    >
      <Routes>
        {/* Dashboard now uses store directly */}
        <Route index element={<DashboardPage />} />

        {/* Legacy pages still receive props from store state */}
        <Route path="history" element={<HistoryPage />} />

        <Route path="charts" element={
          <React.Suspense fallback={<PageLoader />}>
            <ChartsPage />
          </React.Suspense>
        } />

        <Route path="maintenance" element={<Maintenance />} />

        <Route path="reports" element={
          <React.Suspense fallback={<PageLoader />}>
            <div className="space-y-6">
              <FuelMap />
              <Reports />
            </div>
          </React.Suspense>
        } />

        <Route path="glovebox" element={
          <React.Suspense fallback={<PageLoader />}>
            <Glovebox />
          </React.Suspense>
        } />

        <Route path="route" element={
          <React.Suspense fallback={<PageLoader />}>
            <RoutePlanner />
          </React.Suspense>
        } />

        <Route path="settings" element={
          <SettingsPage
            isDarkMode={isDarkMode}
            accentColor={accentColor}
            onToggleTheme={toggleTheme}
            onChangeAccent={(color) => {
              setAccentColor(color);
              localStorage.setItem('yakit_takip_accent_v1', color);
              document.documentElement.setAttribute('data-theme', color);
            }}
          />
        } />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PwaReloadPrompt />
      <SuccessPopup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} logs={logs} />

      {/* Global Modals controlled by store state */}
      <BottomSheetModal
        isOpen={activeModal === 'entry'}
        onClose={closeModal}
        title={editingItem ? 'Sürüş Düzenle' : 'Yeni Sürüş Ekle'}
      >
        <EntryForm
          logs={logs}
          onAdd={(log) => { addLog(log); closeModal(); setShowSuccessPopup(true); }}
          onUpdate={(log) => { updateLog(log); closeModal(); }}
          onImport={(l) => { importLogs(l); closeModal(); }}
          lastOdometer={lastOdometer}
          lastFuelPrice={lastFuelPrice}
          editingLog={editingItem}
        />
      </BottomSheetModal>

      <BottomSheetModal
        isOpen={activeModal === 'fuel'}
        onClose={closeModal}
        title={editingItem ? 'Yakıt Fişi Düzenle' : 'Yeni Yakıt Fişi Ekle'}
      >
        <FuelPurchaseForm
          onAdd={(purchase) => { addFuelPurchase(purchase); closeModal(); setShowSuccessPopup(true); }}
          onUpdate={(purchase) => { updateFuelPurchase(purchase); closeModal(); }}
          onClose={closeModal}
          editingPurchase={editingItem}
          lastOdometer={lastOdometer}
        />
      </BottomSheetModal>

    </AppLayout>
  );
}