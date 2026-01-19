import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemePreview: React.FC<{ isDark: boolean; accent: string }> = ({ isDark, accent }) => {
  return (
    <div className={`rounded-2xl p-4 mb-4 flex items-center gap-4 shadow bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-gray-700' : 'from-white via-gray-100 to-gray-200'}`}
      style={{ border: `2px solid var(--tw-${accent}-500, #3b82f6)` }}>
      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} border-2 border-gray-300`}>
        {isDark ? <Moon className="w-6 h-6 text-yellow-300" /> : <Sun className="w-6 h-6 text-yellow-400" />}
      </div>
      <div>
        <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{isDark ? 'Karanlık Mod' : 'Açık Mod'}</div>
        <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Vurgu: <span className={`font-bold capitalize text-${accent}-500`}>{accent}</span></div>
      </div>
    </div>
  );
};
