import React from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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
    variant?: 'default' | 'premium' | 'gradient';
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
    className = '',
    variant = 'default'
}) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const getVariantStyles = () => {
        switch (variant) {
            case 'premium':
                return 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-indigo-100 dark:border-indigo-800/50';
            case 'gradient':
                return 'bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30 border-violet-200/50 dark:border-violet-700/50';
            default:
                return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
        }
    };

    return (
        <div className={`rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden hover:shadow-md ${getVariantStyles()} ${className}`}>
            {/* Header */}
            <div
                className={`p-4 flex items-center justify-between transition-colors ${collapsible ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className={`p-2.5 rounded-xl shadow-sm transition-transform hover:scale-105 ${iconBgColor}`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                            {variant === 'premium' && (
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {headerRight}
                    {collapsible && (
                        <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95">
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Content with animation */}
            <div className={`transition-all duration-300 ease-out ${(!collapsible || isExpanded) ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <div className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};
