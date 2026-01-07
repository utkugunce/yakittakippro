import React from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

interface ThemeSettingsProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    currentAccent: AccentColor;
    onChangeAccent: (color: AccentColor) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
    isDarkMode, onToggleTheme, currentAccent, onChangeAccent
}) => {

    const colors: { id: AccentColor, name: string, class: string }[] = [
        { id: 'blue', name: 'Mavi', class: 'bg-blue-500' },
        { id: 'green', name: 'Yeşil', class: 'bg-green-500' },
        { id: 'purple', name: 'Mor', class: 'bg-purple-500' },
        { id: 'orange', name: 'Turuncu', class: 'bg-orange-500' },
        { id: 'red', name: 'Kırmızı', class: 'bg-red-500' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                Görünüm Ayarları
            </h3>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Karanlık Mod</h4>
                    <p className="text-xs text-gray-500">Göz yormayan karanlık tema</p>
                </div>
                <button
                    onClick={onToggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {/* Accent Color Picker */}
            <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Vurgu Rengi</h4>
                <div className="flex gap-3">
                    {colors.map(color => (
                        <button
                            key={color.id}
                            onClick={() => onChangeAccent(color.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color.class} ${currentAccent === color.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : ''}`}
                            title={color.name}
                        >
                            {currentAccent === color.id && <Check className="w-5 h-5 text-white" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
