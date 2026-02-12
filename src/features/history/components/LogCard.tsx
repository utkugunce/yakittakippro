import React from 'react';
import { DailyLog } from '../../../types';
import { Edit2, Trash2, Fuel, Map, Coins, Calendar, Droplets, Tag, Gauge, Zap } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

interface LogCardProps {
    log: DailyLog;
    onEdit: (log: DailyLog) => void;
    onDelete: (id: string) => void;
}

export const LogCard: React.FC<LogCardProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
            {/* Gradient Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${log.avgConsumption < 6 ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                log.avgConsumption < 8 ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                    'bg-gradient-to-b from-orange-400 to-orange-600'
                }`} />

            <div className="p-4 pl-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(log.date)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                {new Date(log.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(log)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                            title="Düzenle"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(log.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Grid - 3x3 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Map className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Mesafe</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            {Math.round(log.dailyDistance)} <span className="text-[10px] font-normal text-gray-500">km</span>
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Gauge className="w-3 h-3 text-indigo-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Sayaç</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {log.currentOdometer.toLocaleString('tr-TR')}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-sky-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Ort. Hız</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            {log.avgSpeed ? Math.round(log.avgSpeed) : '-'} <span className="text-[10px] font-normal text-gray-500">km/h</span>
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Fuel className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Tüketim</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            {log.avgConsumption.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">L/100</span>
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Droplets className="w-3 h-3 text-purple-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Yakıt</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            {log.dailyFuelConsumed.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">L</span>
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Tag className="w-3 h-3 text-rose-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Fiyat</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            ₺{log.fuelPrice.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Coins className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Maliyet</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            ₺{Math.round(log.dailyCost)}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Coins className="w-3 h-3 text-teal-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">KM Mal.</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                            ₺{log.costPerKm.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Fuel className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">İstasyon</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {log.fuelStation || '-'}
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                {(log.isRefuelDay || log.notes) && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                            {log.notes || ''}
                        </div>
                        {log.isRefuelDay && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide shrink-0">
                                <Fuel className="w-3 h-3" />
                                Yakıt Alındı
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
