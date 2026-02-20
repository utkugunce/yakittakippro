import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Cloud, CloudOff, LogOut, Download, Upload, Loader2, Check, AlertCircle, Mail } from 'lucide-react';
import {
    supabase,
    isSupabaseConfigured,
    getCurrentUser,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    saveToCloud,
    loadFromCloud
} from '../../lib/supabase';
import { DailyLog, MaintenanceItem, Vehicle } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { AuthGuard } from './AuthGuard';

interface CloudSyncProps {
    logs: DailyLog[];
    maintenanceItems: MaintenanceItem[];
    vehicles: Vehicle[];
    onImportLogs: (logs: DailyLog[]) => void;
    onImportMaintenance: (items: MaintenanceItem[]) => void;
    onImportVehicles: (vehicles: Vehicle[]) => void;
}

export const CloudSync: React.FC<CloudSyncProps> = ({
    logs,
    maintenanceItems,
    vehicles,
    onImportLogs,
    onImportMaintenance,
    onImportVehicles
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Store State
    const autoSync = useAppStore(state => state.autoSync);
    const setAutoSync = useAppStore(state => state.setAutoSync);
    const lastSyncTime = useAppStore(state => state.lastSyncTime);
    const setLastSyncTime = useAppStore(state => state.setLastSyncTime);
    const monthlyBudget = useAppStore(state => state.monthlyBudget);
    const setMonthlyBudget = useAppStore(state => state.setMonthlyBudget);

    // Email auth states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        checkUser();

        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const checkUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    };


    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error, data } = isSignUp
            ? await signUpWithEmail(email, password)
            : await signInWithEmail(email, password);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            // If signup successful and no email confirm needed, user is logged in
            if (isSignUp) {
                if (data.user) {
                    setMessage({ type: 'success', text: 'Kayıt başarılı ve giriş yapıldı!' });
                    // Let auth state listener handle the user update
                } else {
                    setMessage({ type: 'success', text: 'Kayıt başarılı! Lütfen giriş yapın.' });
                }
            } else {
                setMessage({ type: 'success', text: 'Giriş başarılı!' });
            }
            setPassword(''); // Clear password
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        setEmail('');
        setPassword('');
        setMessage({ type: 'success', text: 'Çıkış yapıldı' });
    };

    const handleSaveToCloud = async () => {
        setSyncing(true);
        setMessage(null);

        const result = await saveToCloud({
            logs,
            maintenanceItems,
            vehicles,
            monthlyBudget
        });

        if (result.success) {
            const now = new Date().toLocaleString('tr-TR');
            setLastSyncTime(now);
            setMessage({ type: 'success', text: 'Veriler buluta yüklendi!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Yükleme başarısız' });
        }

        setSyncing(false);
    };

    const handleLoadFromCloud = async () => {
        setSyncing(true);
        setMessage(null);

        const result = await loadFromCloud();

        if (result.success && result.data) {
            if (result.data.logs && result.data.logs.length > 0) {
                // Ensure dates are valid ISO strings
                const processedLogs = result.data.logs.map((log: any) => ({
                    ...log,
                    // If date is missing or invalid, keep it as is (or handle as needed), 
                    // but usually it comes as ISO string from JSON.
                    // We trust the stored data is correct, but let's make sure it's preserved.
                    date: log.date
                }));
                onImportLogs(processedLogs);
            }
            if (result.data.maintenanceItems && result.data.maintenanceItems.length > 0) {
                onImportMaintenance(result.data.maintenanceItems);
            }
            if (result.data.vehicles && result.data.vehicles.length > 0) {
                onImportVehicles(result.data.vehicles);
            }
            if (result.data.monthlyBudget > 0) {
                setMonthlyBudget(result.data.monthlyBudget);
            }
            setMessage({ type: 'success', text: 'Veriler buluttan indirildi!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'İndirme başarısız' });
        }

        setSyncing(false);
    };


    // Not configured
    if (!isSupabaseConfigured()) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                    <CloudOff className="w-6 h-6 text-gray-400" />
                    <h3 className="font-bold text-gray-600 dark:text-gray-300">Cloud Sync Yapılandırılmamış</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Cloud sync için Supabase yapılandırması gerekli. Vercel ortam değişkenlerini ayarlayın:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-400">
                    <p>VITE_SUPABASE_URL=your-project-url</p>
                    <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
            </div>
        );
    }

    // Logged in via AuthGuard
    return (
        <AuthGuard>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                            <Cloud className="w-5 h-5 mr-2 text-primary-600" />
                            Cloud Yedekleme
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Verileriniz güvende ve eşitlenmiş durumda.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                            <Cloud className="w-5 h-5 mr-2 text-green-600" />
                            Cloud Yedekleme
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={handleSaveToCloud}
                            disabled={syncing}
                            className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" /> : <Upload className="w-6 h-6 text-blue-500 mb-2" />}
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Yükle</span>
                        </button>
                        <button
                            onClick={handleLoadFromCloud}
                            disabled={syncing}
                            className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="w-6 h-6 text-green-500 animate-spin mb-2" /> : <Download className="w-6 h-6 text-green-500 mb-2" />}
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">İndir</span>
                        </button>
                    </div>

                    {/* Auto-sync toggle and last sync info */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                        <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Otomatik Senkronizasyon</span>
                            {lastSyncTime && (
                                <p className="text-xs text-gray-400">Son: {lastSyncTime}</p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                const newState = !autoSync;
                                setAutoSync(newState);
                                // localStorage persistence handled by store
                                if (newState && user) {
                                    handleSaveToCloud();
                                }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSync ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSync ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {(logs || []).length} kayıt, {(maintenanceItems || []).length} bakım, {(vehicles || []).length} araç
                    </p>

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
};
