import React from 'react';
import { Activity } from 'lucide-react';

interface EmptyChartStateProps {
    icon?: React.ReactNode;
    title?: string;
    message?: string;
    minHeight?: string;
}

export const EmptyChartState: React.FC<EmptyChartStateProps> = ({
    icon,
    title = 'Yetersiz Veri',
    message = 'Grafiklerin oluşturulması için daha fazla veri girişi yapmanız gerekmektedir.',
    minHeight = 'min-h-[300px]'
}) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 ${minHeight}`}>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                {icon || <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                {message}
            </p>
        </div>
    );
};
