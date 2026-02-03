import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    iconBgColor?: string;
    children: React.ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    headerRight?: React.ReactNode;
    className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    icon,
    iconBgColor = 'bg-primary-50 dark:bg-primary-900/30',
    children,
    collapsible = false,
    defaultExpanded = true,
    headerRight,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors overflow-hidden ${className}`}>
            {/* Header */}
            <div
                className={`p-4 flex items-center justify-between ${collapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}
                onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className={`p-2 rounded-lg ${iconBgColor}`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {headerRight}
                    {collapsible && (
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {(!collapsible || isExpanded) && (
                <div className="p-4 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
};
