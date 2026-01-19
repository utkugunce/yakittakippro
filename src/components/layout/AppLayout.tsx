import React from 'react';
import { NavLink } from 'react-router-dom';
import { Car, LayoutDashboard, History, BarChart3, Wrench, FileText, Settings, Sun, Moon, Fuel, Plus } from 'lucide-react';
import { Vehicle } from '../../types';

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

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    vehicles,
    selectedVehicleId,
    onSelectVehicle,
    isDarkMode,
    onToggleTheme,
    onOpenEntryModal,
    onOpenFuelModal
}) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
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
                                onChange={(e) => onSelectVehicle(e.target.value)}
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
            <main className="flex-grow max-w-5xl mx-auto px-4 py-6 w-full space-y-6 pb-24 md:pb-6">
                {/* Desktop Navigation Tabs */}
                <div className="hidden md:flex p-1 space-x-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>Panel & Giriş</span>
                    </NavLink>
                    <NavLink
                        to="/charts"
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Grafikler
                    </NavLink>
                    <NavLink
                        to="/history"
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <History className="w-4 h-4 mr-2" />
                        Geçmiş
                    </NavLink>
                    <NavLink
                        to="/maintenance"
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <Wrench className="w-4 h-4 mr-2" />
                        Bakım
                    </NavLink>
                    <NavLink
                        to="/reports"
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Raporlar
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Ayarlar
                    </NavLink>
                </div>

                {children}

            </main>

            {/* Mobile Bottom Navigation - Thumb-Zone Optimized */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
                <div className="flex items-center justify-around px-1 pt-1">
                    <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <LayoutDashboard className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Panel</span>
                    </NavLink>
                    <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <History className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Geçmiş</span>
                    </NavLink>
                    <NavLink to="/charts" className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <BarChart3 className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Grafik</span>
                    </NavLink>
                    <NavLink to="/maintenance" className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Wrench className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Bakım</span>
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <FileText className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Rapor</span>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95 active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Settings className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-medium">Ayarlar</span>
                    </NavLink>
                </div>
            </div>

            {/* Floating Action Buttons - Touch Optimized */}
            <div className="fixed bottom-28 md:bottom-8 right-4 flex flex-col space-y-3 z-40">
                <button
                    onClick={onOpenFuelModal}
                    className="w-14 h-14 min-w-[56px] min-h-[56px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95 active:shadow-md flex items-center justify-center"
                    title="Yakıt Alımı"
                    aria-label="Yakıt Alımı"
                >
                    <Fuel className="w-7 h-7" />
                </button>
                <button
                    onClick={onOpenEntryModal}
                    className="w-14 h-14 min-w-[56px] min-h-[56px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95 active:shadow-md flex items-center justify-center"
                    title="Yeni Kayıt Ekle"
                    aria-label="Yeni Kayıt Ekle"
                >
                    <Plus className="w-7 h-7" />
                </button>
            </div>

        </div>
    );
};
