import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Car, LayoutDashboard, History, BarChart3, Wrench, FileText, Settings,
  Sun, Moon, Fuel, Plus, Menu, Map, Warehouse, type LucideIcon,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { typography, textStyles } from '../../design-system/typography';
import { OfflineIndicator } from '../ui/OfflineIndicator';

interface AppLayoutProps {
  children: React.ReactNode;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenEntryModal: () => void;
  onOpenFuelModal: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

// Single source of truth for the primary navigation (desktop tab strip + sidebar).
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Anasayfa', icon: LayoutDashboard, end: true },
  { to: '/charts', label: 'Grafikler', icon: BarChart3 },
  { to: '/history', label: 'Geçmiş', icon: History },
  { to: '/maintenance', label: 'Bakım', icon: Wrench },
  { to: '/glovebox', label: 'Cüzdan', icon: FileText },
  { to: '/reports', label: 'Raporlar', icon: FileText },
  { to: '/route', label: 'Rota', icon: Map },
  { to: '/garage', label: 'Garaj', icon: Warehouse },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
];

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  isDarkMode,
  onToggleTheme,
  onOpenEntryModal,
  onOpenFuelModal,
}) => {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAddMenu && !target.closest('#nav-add-container')) {
        setShowAddMenu(false);
      }
    };
    if (showAddMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAddMenu]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <OfflineIndicator />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`${textStyles.h3} text-gray-900 dark:text-white leading-tight`}>TripBook</h1>
              <p className={textStyles.caption}>Yolculuk Günlüğünüz</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
              <button
                onClick={onOpenFuelModal}
                className="flex items-center px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors group"
              >
                <Fuel className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span>Yakıt Ekle</span>
              </button>
              <button
                onClick={onOpenEntryModal}
                className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span>Kayıt Ekle</span>
              </button>
            </div>

            {vehicles.length > 1 && (
              <select
                value={selectedVehicleId || ''}
                onChange={(e) => onSelectVehicle(e.target.value)}
                title="Araç Seçimi"
                aria-label="Araç Seçimi"
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
              aria-label={isDarkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all touch-manipulation active:scale-95"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:flex lg:gap-6 lg:items-start">
          {/* Desktop Sidebar (lg+) */}
          <aside className="hidden lg:block w-52 shrink-0">
            <nav aria-label="Ana menü" className="sticky top-24 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                      ? `bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ${typography.navItemActive}`
                      : `text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 ${typography.navItem}`
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Content column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tablet horizontal tab strip (md to lg) */}
            <nav aria-label="Ana menü" className="hidden md:flex lg:hidden p-1 gap-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 overflow-x-auto">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex-1 flex items-center justify-center py-2.5 px-2 rounded-lg transition-all whitespace-nowrap ${isActive
                      ? `bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm ${typography.navItemActive}`
                      : `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${typography.navItem}`
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 transition-all duration-300" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        <div className="max-w-lg mx-auto w-full h-16 relative">
          <nav aria-label="Alt menü" className="flex justify-around items-center h-full px-2">
            <NavLink to="/" end id="nav-home" className={({ isActive }) => `flex flex-col items-center justify-center h-full w-14 space-y-1 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={`w-6 h-6 transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                  <span className="text-[10px] font-medium">Anasayfa</span>
                </>
              )}
            </NavLink>

            <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center justify-center h-full w-14 space-y-1 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {({ isActive }) => (
                <>
                  <History className={`w-6 h-6 transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                  <span className="text-[10px] font-medium">Geçmiş</span>
                </>
              )}
            </NavLink>

            {/* Floating Add Button with Speed Dial */}
            <div className="relative -top-6" id="nav-add-container">
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 origin-bottom ${showAddMenu ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                <div className="flex flex-col">
                  <button
                    onClick={() => { onOpenEntryModal(); setShowAddMenu(false); }}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Yolculuk</span>
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                  <button
                    onClick={() => { onOpenFuelModal(); setShowAddMenu(false); }}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Yakıt</span>
                  </button>
                </div>
              </div>

              <button
                id="nav-add-btn"
                aria-label="Hızlı ekle"
                aria-expanded={showAddMenu}
                onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu); }}
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transform transition-all duration-300 border-4 border-gray-50 dark:border-gray-900 ${showAddMenu ? 'rotate-45 scale-105 shadow-primary-500/50' : 'active:scale-95 hover:scale-105'}`}
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            <NavLink to="/charts" className={({ isActive }) => `flex flex-col items-center justify-center h-full w-14 space-y-1 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {({ isActive }) => (
                <>
                  <BarChart3 className={`w-6 h-6 transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                  <span className="text-[10px] font-medium">Analiz</span>
                </>
              )}
            </NavLink>

            <button
              id="nav-more"
              aria-label="Diğer menü"
              aria-expanded={showMobileMenu}
              onClick={() => setShowMobileMenu(true)}
              className={`flex flex-col items-center justify-center h-full w-14 space-y-1 ${showMobileMenu ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <Menu className="w-6 h-6" />
              <span className="text-[10px] font-medium">Menü</span>
            </button>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMobileMenu(false)} style={{ paddingBottom: '90px' }}>
            <div
              className="absolute bottom-24 right-4 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 space-y-2 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-10 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Diğer İşlemler</h3>

              <NavLink to="/garage" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg mr-3"><Warehouse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                <span className="font-medium">Garaj (Şarj, Gider, Servis, AI)</span>
              </NavLink>

              <NavLink to="/maintenance" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3"><Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                <span className="font-medium">Bakım & Parçalar</span>
              </NavLink>

              <NavLink to="/glovebox" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3"><FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
                <span className="font-medium">Araç Cüzdanı</span>
              </NavLink>

              <NavLink to="/reports" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3"><FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
                <span className="font-medium">Raporlar & Harita</span>
              </NavLink>

              <NavLink to="/route" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3"><Map className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                <span className="font-medium">Akıllı Rota Hesapla</span>
              </NavLink>

              <NavLink to="/settings" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3"><Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" /></div>
                <span className="font-medium">Ayarlar</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
