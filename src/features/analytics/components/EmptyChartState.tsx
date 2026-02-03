import React from 'react';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

interface EmptyChartStateProps {
    icon?: React.ReactNode;
    title?: string;
    message?: string;
    minHeight?: string;
    variant?: 'default' | 'compact';
}

export const EmptyChartState: React.FC<EmptyChartStateProps> = ({
    icon,
    title = 'Yetersiz Veri',
    message = 'Grafiklerin oluşturulması için daha fazla veri girişi yapmanız gerekmektedir.',
    minHeight = 'min-h-[300px]',
    variant = 'default'
}) => {
    if (variant === 'compact') {
        return (
            <div className={`flex flex-col items-center justify-center text-center p-6 ${minHeight}`}>
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-xl" />
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-4 rounded-2xl">
                        {icon || <BarChart3 className="w-6 h-6 text-gray-400 dark:text-gray-500" />}
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 ${minHeight}`}>
            {/* Animated Background Elements */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-5 rounded-2xl shadow-inner">
                    {icon || <Activity className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed">
                {message}
            </p>

            {/* Hint */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Veri girdikçe grafikler otomatik güncellenir</span>
            </div>
        </div>
    );
};
