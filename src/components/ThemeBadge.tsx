import React from 'react';
import { Sparkles } from 'lucide-react';

export const ThemeBadge: React.FC<{ isDark: boolean; accent: string }> = ({ isDark, accent }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-${accent}-500 to-${accent}-400 text-white shadow animate-pop mb-2`}>
      <Sparkles className="w-4 h-4" />
      {isDark ? 'Karanlık Mod Aktif' : 'Açık Mod Aktif'}
    </div>
  );
};
