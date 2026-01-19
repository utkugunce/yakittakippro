/**
 * Design System - Main Entry Point
 * TripBook Design Tokens & Utilities
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './animations';

// Component Style Presets
export const componentStyles = {
    // Cards
    card: 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700',
    cardInteractive: 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer',
    cardGlass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-gray-700',
    cardGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-700',

    // Buttons
    buttonBase: 'inline-flex items-center justify-center font-medium rounded-xl transition-all touch-manipulation active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
    buttonPrimary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    buttonSecondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    buttonGhost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
    buttonDanger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',

    // Inputs
    input: 'w-full px-4 py-3 min-h-[48px] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 border border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all touch-manipulation',
    inputError: 'border-red-500 focus:ring-red-500',

    // Badges
    badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
    badgeSuccess: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    badgeWarning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    badgeDanger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    badgeInfo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',

    // Stats
    statCard: 'bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700 backdrop-blur-sm',
    statLabel: 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
    statValue: 'text-xl font-bold text-gray-800 dark:text-white',

    // Navigation
    navItem: 'flex flex-col items-center justify-center min-h-[52px] min-w-[52px] p-1.5 rounded-xl touch-manipulation transition-all active:scale-95',
    navItemActive: 'text-primary-600 dark:text-primary-400',
    navItemInactive: 'text-gray-500 dark:text-gray-400',

    // Modals
    modalOverlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    modalContent: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto',

    // Tooltips
    tooltip: 'px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-md shadow-lg',

    // Dividers
    divider: 'h-px bg-gray-200 dark:bg-gray-700',
    dividerVertical: 'w-px bg-gray-200 dark:bg-gray-700',

    // Loading
    skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md',
    spinner: 'animate-spin text-primary-600',

    // Lists
    listItem: 'flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
    listItemBordered: 'flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
} as const;

// Icon sizes
export const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12',
} as const;

// Touch target sizes
export const touchTargets = {
    min: 'min-h-[44px] min-w-[44px]',  // Apple HIG standard
    comfortable: 'min-h-[48px] min-w-[48px]',
    large: 'min-h-[56px] min-w-[56px]',
} as const;

// Safe area utilities
export const safeArea = {
    paddingTop: 'pt-[env(safe-area-inset-top)]',
    paddingBottom: 'pb-[env(safe-area-inset-bottom)]',
    paddingLeft: 'pl-[env(safe-area-inset-left)]',
    paddingRight: 'pr-[env(safe-area-inset-right)]',
    paddingX: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
    paddingY: 'py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]',
    paddingAll: 'p-[env(safe-area-inset-top)] p-[env(safe-area-inset-bottom)] p-[env(safe-area-inset-left)] p-[env(safe-area-inset-right)]',
} as const;
