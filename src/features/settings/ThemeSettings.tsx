import React from 'react';
import { Check, Palette, Moon } from 'lucide-react';
import { ThemePreview } from '../../components/ThemePreview';
import { ThemeBadge } from '../../components/ThemeBadge';
import { ThemeSettingsTips } from '../../components/ThemeSettingsTips';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'violet';

interface ThemeSettingsProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    currentAccent: AccentColor;
    onChangeAccent: (color: AccentColor) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
    isDarkMode, onToggleTheme, currentAccent, onChangeAccent
}) => {

    const colors: { id: AccentColor, name: string, class: string, ring: string }[] = [
        { id: 'blue', name: 'Okyanus Mavisi', class: 'bg-gradient-to-br from-blue-400 to-blue-600', ring: 'ring-blue-400' },
        { id: 'green', name: 'Zümrüt Yeşili', class: 'bg-gradient-to-br from-emerald-400 to-emerald-600', ring: 'ring-emerald-400' },
        { id: 'purple', name: 'Soylu Mor', class: 'bg-gradient-to-br from-purple-400 to-purple-600', ring: 'ring-purple-400' },
        { id: 'violet', name: 'Gece Menekşesi', class: 'bg-gradient-to-br from-violet-500 to-violet-700', ring: 'ring-violet-400' },
        { id: 'orange', name: 'Gün Batımı', class: 'bg-gradient-to-br from-orange-400 to-orange-600', ring: 'ring-orange-400' },
        { id: 'red', name: 'Lava Kırmızısı', class: 'bg-gradient-to-br from-red-400 to-red-600', ring: 'ring-red-400' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Görünüm & Tema</h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Preview Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <ThemePreview isDark={isDarkMode} accent={currentAccent} />
                        <div className="flex justify-center">
                            <ThemeBadge isDark={isDarkMode} accent={currentAccent} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <ThemeSettingsTips />

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-amber-100 text-amber-600'}`}>
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Karanlık Mod</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Göz yormayan karanlık tema</p>
                                </div>
                            </div>
                            <button
                                onClick={onToggleTheme}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-primary-500 rounded-full" />
                        Vurgu Rengi Seçimi
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {colors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => onChangeAccent(color.id)}
                                className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${currentAccent === color.id
                                        ? 'bg-gray-50 dark:bg-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-600'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${color.class}`}>
                                    {currentAccent === color.id && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                                </div>
                                <span className={`text-xs font-medium ${currentAccent === color.id
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {color.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
