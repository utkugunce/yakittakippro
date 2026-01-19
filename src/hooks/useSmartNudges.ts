import { useMemo } from 'react';
import { DailyLog, FuelPurchase, MaintenanceItem, VehiclePart } from '../types';

export interface SmartNudge {
    id: string;
    type: 'morning' | 'evening' | 'high-consumption' | 'maintenance' | 'budget' | 'streak' | 'tip';
    priority: 'high' | 'medium' | 'low';
    icon: string;
    title: string;
    message: string;
    action?: {
        label: string;
        handler: string; // 'addLog' | 'addFuel' | 'maintenance' | 'dismiss'
    };
    dismissable: boolean;
}

interface UseSmartNudgesProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    maintenanceItems: MaintenanceItem[];
    vehicleParts: VehiclePart[];
    currentOdometer: number;
    monthlyBudget?: number;
}

export function useSmartNudges({
    logs,
    purchases,
    maintenanceItems,
    vehicleParts,
    currentOdometer,
    monthlyBudget = 0
}: UseSmartNudgesProps): SmartNudge[] {
    return useMemo(() => {
        const nudges: SmartNudge[] = [];
        const now = new Date();
        const currentHour = now.getHours();

        // Sort logs and purchases
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // --- Time-based Nudges ---
        
        // Morning nudge (7-9 AM) - Fuel reminder
        if (currentHour >= 7 && currentHour < 9) {
            // Check if last refuel was more than 5 days ago
            if (sortedPurchases.length > 0) {
                const lastPurchase = new Date(sortedPurchases[0].date);
                const daysSinceRefuel = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysSinceRefuel >= 5) {
                    nudges.push({
                        id: 'morning-fuel',
                        type: 'morning',
                        priority: 'medium',
                        icon: '☀️',
                        title: 'Günaydın!',
                        message: `Son yakıt alımından ${daysSinceRefuel} gün geçti. Yola çıkmadan kontrol etmeyi unutma!`,
                        action: {
                            label: 'Yakıt Al',
                            handler: 'addFuel'
                        },
                        dismissable: true
                    });
                }
            }
        }

        // Evening nudge (18-21) - Daily log reminder
        if (currentHour >= 18 && currentHour < 21) {
            // Check if today's log exists
            const today = now.toISOString().split('T')[0];
            const todayLog = logs.find(l => l.date === today);
            
            if (!todayLog && logs.length > 0) {
                // Check last log date
                const lastLogDate = sortedLogs[0]?.date;
                if (lastLogDate && lastLogDate !== today) {
                    nudges.push({
                        id: 'evening-log',
                        type: 'evening',
                        priority: 'low',
                        icon: '🌙',
                        title: 'Günlük Kayıt',
                        message: 'Bugünkü kilometreyi kaydetmeyi unutma! Sadece 30 saniye.',
                        action: {
                            label: 'Kayıt Ekle',
                            handler: 'addLog'
                        },
                        dismissable: true
                    });
                }
            }
        }

        // --- Consumption-based Nudges ---
        
        // High consumption detection
        if (sortedPurchases.length >= 4) {
            const last2Weeks = purchases.filter(p => {
                const purchaseDate = new Date(p.date);
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                return purchaseDate >= twoWeeksAgo;
            });

            const prev2Weeks = purchases.filter(p => {
                const purchaseDate = new Date(p.date);
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                const fourWeeksAgo = new Date();
                fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                return purchaseDate >= fourWeeksAgo && purchaseDate < twoWeeksAgo;
            });

            const recentCost = last2Weeks.reduce((sum, p) => sum + p.totalAmount, 0);
            const prevCost = prev2Weeks.reduce((sum, p) => sum + p.totalAmount, 0);

            if (prevCost > 0 && recentCost > prevCost * 1.15) {
                const increase = Math.round(((recentCost - prevCost) / prevCost) * 100);
                nudges.push({
                    id: 'high-consumption',
                    type: 'high-consumption',
                    priority: 'high',
                    icon: '⚠️',
                    title: 'Yüksek Tüketim Uyarısı',
                    message: `Bu hafta %${increase} fazla harcama yapıldı. Lastik basıncını ve sürüş alışkanlıklarını kontrol et.`,
                    dismissable: true
                });
            }
        }

        // --- Maintenance Nudges ---
        
        // Check upcoming maintenance
        maintenanceItems.forEach(item => {
            let isUrgent = false;
            let remaining = '';

            if (item.type === 'km' || item.type === 'both') {
                if (item.nextDueKm) {
                    const kmRemaining = item.nextDueKm - currentOdometer;
                    if (kmRemaining <= 500 && kmRemaining > 0) {
                        isUrgent = true;
                        remaining = `${kmRemaining} km`;
                    } else if (kmRemaining <= 0) {
                        isUrgent = true;
                        remaining = 'GEÇMİŞ!';
                    }
                }
            }

            if (!isUrgent && (item.type === 'date' || item.type === 'both')) {
                if (item.dueDate) {
                    const dueDate = new Date(item.dueDate);
                    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysRemaining <= 7 && daysRemaining > 0) {
                        isUrgent = true;
                        remaining = `${daysRemaining} gün`;
                    } else if (daysRemaining <= 0) {
                        isUrgent = true;
                        remaining = 'GEÇMİŞ!';
                    }
                }
            }

            if (isUrgent) {
                nudges.push({
                    id: `maintenance-${item.id}`,
                    type: 'maintenance',
                    priority: remaining === 'GEÇMİŞ!' ? 'high' : 'medium',
                    icon: '🔧',
                    title: item.title,
                    message: remaining === 'GEÇMİŞ!' 
                        ? `${item.title} süresi geçti! Hemen ilgilenmelisin.`
                        : `${item.title} için ${remaining} kaldı. Randevu almayı unutma!`,
                    action: {
                        label: 'Bakıma Git',
                        handler: 'maintenance'
                    },
                    dismissable: false
                });
            }
        });

        // Check vehicle parts
        vehicleParts.filter(p => p.isActive && p.lifespanKm).forEach(part => {
            const dueKm = part.installKm + part.lifespanKm!;
            const remaining = dueKm - currentOdometer;
            
            if (remaining <= 500 && remaining > 0) {
                nudges.push({
                    id: `part-${part.id}`,
                    type: 'maintenance',
                    priority: 'medium',
                    icon: '⚙️',
                    title: `${part.name} Değişimi`,
                    message: `${part.name} ömrünün sonuna yaklaşıyor. ${remaining} km kaldı.`,
                    action: {
                        label: 'Bakıma Git',
                        handler: 'maintenance'
                    },
                    dismissable: false
                });
            }
        });

        // --- Budget Nudges ---
        
        if (monthlyBudget > 0) {
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const thisMonthPurchases = purchases.filter(p => {
                const date = new Date(p.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            const thisMonthSpent = thisMonthPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
            const budgetUsedPercent = (thisMonthSpent / monthlyBudget) * 100;
            const dayOfMonth = now.getDate();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const expectedPercent = (dayOfMonth / daysInMonth) * 100;

            if (budgetUsedPercent >= 90) {
                nudges.push({
                    id: 'budget-critical',
                    type: 'budget',
                    priority: 'high',
                    icon: '🚨',
                    title: 'Bütçe Uyarısı',
                    message: `Aylık bütçenin %${Math.round(budgetUsedPercent)}'ini kullandın! Dikkatli ol.`,
                    dismissable: true
                });
            } else if (budgetUsedPercent > expectedPercent + 15) {
                nudges.push({
                    id: 'budget-warning',
                    type: 'budget',
                    priority: 'medium',
                    icon: '💰',
                    title: 'Bütçe Hatırlatması',
                    message: `Planlanandan hızlı harcıyorsun. Şu ana kadar ₺${thisMonthSpent.toFixed(0)} / ₺${monthlyBudget}`,
                    dismissable: true
                });
            }
        }

        // --- Streak & Motivation Nudges ---
        
        // Log streak detection
        if (sortedLogs.length >= 7) {
            let streak = 0;
            const checkDate = new Date();
            
            for (let i = 0; i < 30; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (logs.some(l => l.date === dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            if (streak >= 7) {
                nudges.push({
                    id: 'streak',
                    type: 'streak',
                    priority: 'low',
                    icon: '🔥',
                    title: `${streak} Günlük Seri!`,
                    message: 'Harika gidiyorsun! Düzenli kayıt tutmak yakıt tasarrufunda çok önemli.',
                    dismissable: true
                });
            }
        }

        // --- Tips (Random daily tip) ---
        const tips = [
            { icon: '🚗', message: 'Sabit hızda sürmek %15\'e kadar yakıt tasarrufu sağlar.' },
            { icon: '🔄', message: 'Hava filtresi temizliği tüketimi %10 azaltabilir.' },
            { icon: '⚖️', message: 'Bagajdaki fazla yük 100 kg için ~%1-2 fazla yakıt demek.' },
            { icon: '🌡️', message: 'Soğuk motorla agresif sürmek tüketimi %20 artırır.' },
            { icon: '💨', message: 'Lastik basıncı %1 düşükse yakıt tüketimi %0.3 artar.' },
            { icon: '🚦', message: 'Motor rölantide 10 saniyeden fazla bekleme, kapat-aç daha tasarruflu.' }
        ];

        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const todaysTip = tips[dayOfYear % tips.length];

        // Only show tip if no high priority nudges
        if (!nudges.some(n => n.priority === 'high')) {
            nudges.push({
                id: 'daily-tip',
                type: 'tip',
                priority: 'low',
                icon: todaysTip.icon,
                title: 'Günün İpucu',
                message: todaysTip.message,
                dismissable: true
            });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    }, [logs, purchases, maintenanceItems, vehicleParts, currentOdometer, monthlyBudget]);
}
