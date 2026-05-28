import React from 'react';
import { Plus, Fuel, History, BarChart3, Wrench, FileText } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
    type: 'logs' | 'fuel' | 'charts' | 'maintenance' | 'reports' | 'generic';
    onAction?: () => void;
    actionLabel?: string;
}

const emptyStateConfig = {
    logs: {
        emoji: '📝',
        title: 'Henüz Kayıt Yok',
        description: 'Günlük sürüş verilerini kaydetmeye başla! Her kayıt tasarruf için bir adım.',
        icon: History,
        actionLabel: 'İlk Kaydı Ekle'
    },
    fuel: {
        emoji: '⛽',
        title: 'Yakıt Alımı Yok',
        description: 'Yakıt alımlarını kaydet, harcamalarını takip et ve tasarruf fırsatlarını keşfet!',
        icon: Fuel,
        actionLabel: 'Yakıt Ekle'
    },
    charts: {
        emoji: '📊',
        title: 'Grafik İçin Veri Gerekli',
        description: 'En az birkaç kayıt ekledikten sonra burada harika grafikler göreceksin!',
        icon: BarChart3,
        actionLabel: 'Kayıt Ekle'
    },
    maintenance: {
        emoji: '🔧',
        title: 'Bakım Planı Boş',
        description: 'Yağ değişimi, lastik, muayene... Bakım hatırlatıcıları ekleyerek aracını koru!',
        icon: Wrench,
        actionLabel: 'Bakım Ekle'
    },
    reports: {
        emoji: '📈',
        title: 'Rapor İçin Veri Yok',
        description: 'Veriler biriktikçe detaylı raporlar ve analizler burada görünecek.',
        icon: FileText,
        actionLabel: 'Veri Ekle'
    },
    generic: {
        emoji: '🚀',
        title: 'Burası Boş',
        description: 'Henüz gösterilecek bir şey yok. İlk adımı atarak başla!',
        icon: Plus,
        actionLabel: 'Başla'
    }
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, actionLabel }) => {
    const config = emptyStateConfig[type];
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {/* Animated emoji */}
            <div className="text-6xl mb-4 animate-bounce">
                {config.emoji}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {config.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6 leading-relaxed">
                {config.description}
            </p>

            {/* Action button */}
            {onAction && (
                <Button
                    onClick={onAction}
                    variant="default"
                    size="lg"
                    leftIcon={Icon}
                    className="shadow-lg"
                >
                    {actionLabel || config.actionLabel}
                </Button>
            )}

            {/* Decorative background */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

// Compact version for inline use
export const EmptyStateCompact: React.FC<{ message: string; emoji?: string }> = ({ 
    message, 
    emoji = '📭' 
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-4xl mb-2">{emoji}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
};
