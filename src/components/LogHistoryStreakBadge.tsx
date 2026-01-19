import React from 'react';
import { Flame } from 'lucide-react';

interface LogHistoryStreakBadgeProps {
  streak: number;
}

export const LogHistoryStreakBadge: React.FC<LogHistoryStreakBadgeProps> = ({ streak }) => {
  if (streak < 2) return null;
  let label = '';
  if (streak >= 30) label = '🔥 Süper Seri!';
  else if (streak >= 7) label = 'Harika Seri!';
  else if (streak >= 3) label = 'Güzel Başlangıç!';

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full shadow animate-pop mb-3">
      <Flame className="w-4 h-4" />
      <span className="font-semibold">{label} {streak} gün</span>
    </div>
  );
};
