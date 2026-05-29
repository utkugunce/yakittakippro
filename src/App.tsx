import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AccentColor } from './types';
import { EntryForm } from './features/fuel/components/EntryForm';
import { FuelPurchaseForm } from './features/fuel/components/FuelPurchaseForm';
import { AppLayout } from './components/layout/AppLayout';
import { PwaReloadPrompt } from './components/pwa/PwaReloadPrompt';
import { SuccessPopup } from './components/ui/SuccessPopup';
import { Toaster } from './components/ui/Toaster';
import { OnboardingModal } from './features/onboarding/OnboardingModal';
import { BottomSheetModal } from './components/ui/BottomSheetModal';
import { PageLoader } from './components/PageLoader';
import { useAppStore } from './stores/appStore';
import { STORAGE_KEYS, getString, setString } from './lib/storage';

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
const GaragePage = React.lazy(() => import('./features/garage/GaragePage').then(module => ({ default: module.GaragePage })));
const ChargingPage = React.lazy(() => import('./features/charging/ChargingPage').then(module => ({ default: module.ChargingPage })));
const ExpensesPage = React.lazy(() => import('./features/expenses/ExpensesPage').then(module => ({ default: module.ExpensesPage })));
const ServiceHistoryPage = React.lazy(() => import('./features/service/ServiceHistoryPage').then(module => ({ default: module.ServiceHistoryPage })));
const FuelPricePage = React.lazy(() => import('./features/prices/FuelPricePage').then(module => ({ default: module.FuelPricePage })));
const TripsPage = React.lazy(() => import('./features/trips/TripsPage').then(module => ({ default: module.TripsPage })));
const AssistantPage = React.lazy(() => import('./features/assistant/AssistantPage').then(module => ({ default: module.AssistantPage })));

const THEME_STORAGE_KEY = STORAGE_KEYS.theme;
const ACCENT_STORAGE_KEY = STORAGE_KEYS.accent;

type ThemePref = 'light' | 'dark' | 'system';
const prefersDark = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
const resolveDark = (pref: ThemePref): boolean => (pref === 'system' ? prefersDark() : pref === 'dark');

export default function App() {
  const {
    logs, vehicles, selectedVehicleId, activeModal, editingItem,
    addLog, updateLog, importLogs,
    addFuelPurchase, updateFuelPurchase,
    setSelectedVehicleId, openModal, closeModal, hydrate
  } = useAppStore();

  const [themePref, setThemePref] = React.useState<ThemePref>('system');
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [accentColor, setAccentColor] = React.useState<AccentColor>('blue');
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const applyDark = (dark: boolean) => {
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  };

  // Initial Hydration
  useEffect(() => {
    const hydration = hydrate();

    // Show the first-run onboarding once, only if there's still no data after
    // hydration completes.
    if (!getString(STORAGE_KEYS.onboarding)) {
      Promise.resolve(hydration).then(() => {
        const s = useAppStore.getState();
        if (s.logs.length === 0 && s.fuelPurchases.length === 0) setShowOnboarding(true);
      });
    }

    // Gamification Check
    import('./features/gamification/store/gamificationStore').then(({ useGamificationStore }) => {
      useGamificationStore.getState().updateStreak();
    });

    // Theme initialization. Default is "system" so a first-time visitor gets the
    // OS preference automatically; explicit light/dark is remembered.
    const saved = getString(THEME_STORAGE_KEY);
    const pref: ThemePref = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    setThemePref(pref);
    applyDark(resolveDark(pref));

    const savedAccent = getString(ACCENT_STORAGE_KEY) as AccentColor | null;
    if (savedAccent) {
      setAccentColor(savedAccent);
      document.documentElement.setAttribute('data-theme', savedAccent);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow OS theme changes live while in "system" mode.
  useEffect(() => {
    if (themePref !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themePref]);

  // Toggle Dark Mode -> switches to an explicit (non-system) preference.
  const toggleTheme = () => {
    const next: ThemePref = isDarkMode ? 'light' : 'dark';
    setThemePref(next);
    setString(THEME_STORAGE_KEY, next);
    applyDark(resolveDark(next));
  };

  // Revert to following the operating system theme.
  const useSystemTheme = () => {
    setThemePref('system');
    setString(THEME_STORAGE_KEY, 'system');
    applyDark(resolveDark('system'));
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
            themePref={themePref}
            onUseSystemTheme={useSystemTheme}
            accentColor={accentColor}
            onToggleTheme={toggleTheme}
            onChangeAccent={(color) => {
              setAccentColor(color);
              setString(ACCENT_STORAGE_KEY, color);
              document.documentElement.setAttribute('data-theme', color);
            }}
          />
        } />

        {/* Garage hub + new feature pages */}
        <Route path="garage" element={<React.Suspense fallback={<PageLoader />}><GaragePage /></React.Suspense>} />
        <Route path="charging" element={<React.Suspense fallback={<PageLoader />}><ChargingPage /></React.Suspense>} />
        <Route path="expenses" element={<React.Suspense fallback={<PageLoader />}><ExpensesPage /></React.Suspense>} />
        <Route path="service" element={<React.Suspense fallback={<PageLoader />}><ServiceHistoryPage /></React.Suspense>} />
        <Route path="prices" element={<React.Suspense fallback={<PageLoader />}><FuelPricePage /></React.Suspense>} />
        <Route path="trips" element={<React.Suspense fallback={<PageLoader />}><TripsPage /></React.Suspense>} />
        <Route path="assistant" element={<React.Suspense fallback={<PageLoader />}><AssistantPage /></React.Suspense>} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PwaReloadPrompt />
      <Toaster />
      <OnboardingModal
        open={showOnboarding}
        onStart={() => { setString(STORAGE_KEYS.onboarding, 'seen'); setShowOnboarding(false); openModal('entry'); }}
        onClose={() => { setString(STORAGE_KEYS.onboarding, 'seen'); setShowOnboarding(false); }}
      />
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