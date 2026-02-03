import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Trash2, Check, Clock, Calendar, Gauge } from 'lucide-react';
import { MaintenanceItem } from '../../../types';

interface MaintenanceCardProps {
    item: MaintenanceItem;
    currentOdometer: number;
    onUpdate: (id: string, km: number) => void;
    onDelete: (id: string) => void;
}

interface StatusInfo {
    color: string;
    bgColor: string;
    borderColor: string;
    text: string;
    icon: React.ReactNode;
    remaining: string;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ item, currentOdometer, onUpdate, onDelete }) => {

    const calculateStatus = (): StatusInfo => {
        // Date Check
        let dateStatus = { isDue: false, diff: 0, text: '' };
        if ((item.type === 'date' || item.type === 'both') && item.dueDate) {
            const days = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (days < 0) dateStatus = { isDue: true, diff: days, text: `${Math.abs(days)} gün geçti` };
            else if (days <= (item.notifyBeforeDays || 30)) dateStatus = { isDue: true, diff: days, text: `${days} gün kaldı` };
            else dateStatus = { isDue: false, diff: days, text: `${days} gün kaldı` };
        }

        // KM Check
        let kmStatus = { isDue: false, diff: 0, text: '' };
        if ((item.type === 'km' || item.type === 'both') && item.nextDueKm) {
            const remaining = item.nextDueKm - currentOdometer;
            if (remaining < 0) kmStatus = { isDue: true, diff: remaining, text: `${Math.abs(remaining).toLocaleString()} km geçti` };
            else if (remaining <= (item.notifyBeforeKm || 1000)) kmStatus = { isDue: true, diff: remaining, text: `${remaining.toLocaleString()} km kaldı` };
            else kmStatus = { isDue: false, diff: remaining, text: `${remaining.toLocaleString()} km kaldı` };
        }

        // Combine
        const getResult = (diff: number, text: string, isWarning: boolean): StatusInfo => {
            if (diff < 0) return {
                color: 'text-red-600 dark:text-red-400',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                borderColor: 'border-red-200 dark:border-red-800/50',
                text: 'Süresi Dolmuş',
                icon: <AlertCircle className="w-5 h-5 text-red-500" />,
                remaining: text
            };
            if (isWarning) return {
                color: 'text-amber-600 dark:text-amber-400',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                borderColor: 'border-amber-200 dark:border-amber-800/50',
                text: 'Yaklaşıyor',
                icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
                remaining: text
            };
            return {
                color: 'text-emerald-600 dark:text-emerald-400',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                borderColor: 'border-emerald-200 dark:border-emerald-800/50',
                text: 'Durum İyi',
                icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
                remaining: text
            };
        };

        if (item.type === 'date') return getResult(dateStatus.diff, dateStatus.text, dateStatus.isDue);
        if (item.type === 'km') return getResult(kmStatus.diff, kmStatus.text, kmStatus.isDue);

        // Both - return the worse one
        if (dateStatus.diff < 0 || kmStatus.diff < 0) {
            if (dateStatus.diff < 0 && kmStatus.diff >= 0) return getResult(dateStatus.diff, dateStatus.text, true);
            if (kmStatus.diff < 0 && dateStatus.diff >= 0) return getResult(kmStatus.diff, kmStatus.text, true);
            return getResult(kmStatus.diff, `${kmStatus.text} / ${dateStatus.text}`, true);
        }

        const isWarning = dateStatus.isDue || kmStatus.isDue;
        return getResult(0, `${kmStatus.text} / ${dateStatus.text}`, isWarning);
    };

    const status = calculateStatus();
    const isDate = item.type === 'date';
    const isKm = item.type === 'km';
    const isBoth = item.type === 'both';

    return (
        <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border ${status.borderColor} shadow-sm hover:shadow-md transition-all duration-300`}>
            {/* Status gradient stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${status.text === 'Süresi Dolmuş'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                    : status.text === 'Yaklaşıyor'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`} />

            <div className="p-4 pt-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${status.bgColor}`}>
                            {status.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{item.title}</h4>
                            <div className={`flex items-center gap-1 text-xs ${status.color} font-medium mt-0.5`}>
                                <Clock className="w-3 h-3" />
                                <span>{status.text}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {(isKm || isBoth) && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[10px] text-gray-400 uppercase font-medium">Periyot</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {item.intervalKm?.toLocaleString('tr-TR')} km
                            </p>
                        </div>
                    )}
                    {(isDate || isBoth) && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[10px] text-gray-400 uppercase font-medium">Son Tarih</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString('tr-TR') : '-'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Remaining */}
                <div className={`${status.bgColor} rounded-xl p-3 mb-4`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Kalan:</span>
                        <span className={`text-sm font-bold ${status.color}`}>{status.remaining}</span>
                    </div>
                </div>

                {/* Actions */}
                {(isKm || isBoth) && (
                    <button
                        onClick={() => {
                            if (confirm('Bu bakımı tamamlandı olarak işaretlemek istiyor musunuz?')) {
                                onUpdate(item.id, currentOdometer);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-primary-500/20 transition-all active:scale-[0.98]"
                    >
                        <Check className="w-4 h-4" />
                        Yapıldı Olarak İşaretle
                    </button>
                )}
            </div>
        </div>
    );
};
