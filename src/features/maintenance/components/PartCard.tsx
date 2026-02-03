import React from 'react';
import { Disc, Zap, Fan, Circle, Archive, Trash2, Package } from 'lucide-react';
import { VehiclePart, PartType } from '../../../types';

interface PartCardProps {
    part: VehiclePart;
    currentOdometer: number;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const PART_ICONS: Record<PartType, React.ReactNode> = {
    tire: <Disc className="w-5 h-5" />,
    battery: <Zap className="w-5 h-5" />,
    wiper: <Fan className="w-5 h-5" />,
    pad: <Circle className="w-5 h-5" />,
    other: <Archive className="w-5 h-5" />
};

const PART_LABELS: Record<PartType, string> = {
    tire: 'Lastik',
    battery: 'Akü',
    wiper: 'Silecek',
    pad: 'Balata',
    other: 'Diğer'
};

export const PartCard: React.FC<PartCardProps> = ({ part, currentOdometer, onToggle, onDelete }) => {
    const usage = currentOdometer - part.installKm;
    const lifePercent = part.lifespanKm ? Math.min(100, (usage / part.lifespanKm) * 100) : 0;
    const isNearEnd = lifePercent > 80;
    const isOverdue = lifePercent > 100;

    const getLifeColor = () => {
        if (isOverdue) return 'from-red-500 to-rose-500';
        if (isNearEnd) return 'from-amber-500 to-orange-500';
        return 'from-emerald-500 to-teal-500';
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/5 to-transparent rounded-bl-full" />

            {/* Status Badge */}
            {part.type === 'tire' && (
                <div className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-sm ${part.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                    {part.isActive ? '✓ TAKILI' : 'DEPODA'}
                </div>
            )}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl shadow-sm transition-transform hover:scale-105 ${part.isActive
                            ? 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 dark:from-primary-900/40 dark:to-primary-800/20 dark:text-primary-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                        }`}>
                        {PART_ICONS[part.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                {PART_LABELS[part.type]}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate">{part.name}</h4>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium mb-1">Takılma</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            {part.installKm.toLocaleString('tr-TR')} km
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {new Date(part.installDate).toLocaleDateString('tr-TR')}
                        </p>
                    </div>
                    <div className={`rounded-xl p-3 ${isOverdue
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : isNearEnd
                                ? 'bg-amber-50 dark:bg-amber-900/20'
                                : 'bg-emerald-50 dark:bg-emerald-900/20'
                        }`}>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium mb-1">Kullanım</p>
                        <p className={`text-sm font-bold ${isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : isNearEnd
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                            {usage.toLocaleString('tr-TR')} km
                        </p>
                        {part.lifespanKm && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                / {part.lifespanKm.toLocaleString('tr-TR')} km
                            </p>
                        )}
                    </div>
                </div>

                {/* Lifespan Progress */}
                {part.lifespanKm && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium">Ömür Durumu</span>
                            <span className={`text-xs font-bold ${isOverdue ? 'text-red-500' : isNearEnd ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                %{Math.min(100, lifePercent).toFixed(0)}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${getLifeColor()} transition-all duration-500`}
                                style={{ width: `${Math.min(100, lifePercent)}%` }}
                            />
                        </div>
                        {isOverdue && (
                            <p className="text-[10px] text-red-500 mt-1.5 font-medium">
                                ⚠️ Beklenen ömrü aştı, değiştirmeyi düşünün
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                        {part.type === 'tire' && !part.isActive && (
                            <button
                                onClick={() => onToggle(part.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
                            >
                                <Package className="w-3.5 h-3.5" />
                                Tak
                            </button>
                        )}
                        {part.type === 'tire' && part.isActive && (
                            <button
                                onClick={() => onToggle(part.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                            >
                                <Archive className="w-3.5 h-3.5" />
                                Depoya Kaldır
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => onDelete(part.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
