import React from 'react';
import { Calendar } from 'lucide-react';

export type TimeRange = '7d' | '15d' | '30d' | '90d' | 'all';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Gün' },
  { value: '15d', label: '15 Gün' },
  { value: '30d', label: '30 Gün' },
  { value: '90d', label: '3 Ay' },
  { value: 'all', label: 'Tümü' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="hidden sm:flex items-center px-2 text-gray-500 dark:text-gray-400">
        <Calendar className="w-4 h-4" />
      </div>
      
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300
            ${value === range.value
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {value === range.value && (
            <span 
              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg"
              style={{
                animation: 'scaleIn 0.2s ease-out',
              }}
            />
          )}
          <span className="relative z-10">{range.label}</span>
        </button>
      ))}
      
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Helper function to filter data by time range
export const filterByTimeRange = <T extends { date: string }>(
  data: T[],
  range: TimeRange
): T[] => {
  if (range === 'all') return data;

  const days = {
    '7d': 7,
    '15d': 15,
    '30d': 30,
    '90d': 90,
  }[range];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return data.filter(item => new Date(item.date) >= cutoff);
};
