import { Badge } from '../types';

export const INITIAL_BADGES: Badge[] = [
    {
        id: 'first_log',
        name: 'İlk Adım',
        description: 'İlk yakıt kaydını oluştur.',
        iconName: 'Flag',
        conditionType: 'FIRST_LOG',
        threshold: 1,
    },
    {
        id: 'log_master_1',
        name: 'Müdavim',
        description: 'Toplam 10 yakıt kaydı oluştur.',
        iconName: 'Award',
        conditionType: 'LOG_COUNT',
        threshold: 10,
    },
    {
        id: 'log_master_2',
        name: 'Usta Şoför',
        description: 'Toplam 50 yakıt kaydı oluştur.',
        iconName: 'Medal',
        conditionType: 'LOG_COUNT',
        threshold: 50,
    },
    {
        id: 'streak_week',
        name: 'İstikrarlı',
        description: '7 günlük seri yap.',
        iconName: 'Flame',
        conditionType: 'STREAK_DAYS',
        threshold: 7,
    },
    {
        id: 'streak_month',
        name: 'Sadık Sürücü',
        description: '30 günlük seri yap.',
        iconName: 'Crown',
        conditionType: 'STREAK_DAYS',
        threshold: 30,
    },
];
