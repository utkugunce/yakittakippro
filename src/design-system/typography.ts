/**
 * Design System - Typography Tokens
 * Consistent text styles across the app
 */

// Font families
export const fontFamily = {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
} as const;

// Font sizes (rem based for accessibility)
export const fontSize = {
    xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
    '5xl': ['3rem', { lineHeight: '1' }],          // 48px
} as const;

// Font weights
export const fontWeight = {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
} as const;

// Letter spacing
export const letterSpacing = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
} as const;

// Line heights
export const lineHeight = {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
} as const;

// Pre-composed text styles
export const textStyles = {
    // Headings
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-bold tracking-tight',
    h3: 'text-xl font-bold',
    h4: 'text-lg font-semibold',
    h5: 'text-base font-semibold',
    h6: 'text-sm font-semibold',

    // Body text
    body: 'text-base font-normal leading-relaxed',
    bodySmall: 'text-sm font-normal leading-relaxed',
    bodyLarge: 'text-lg font-normal leading-relaxed',

    // UI text
    label: 'text-xs font-bold text-gray-500 uppercase tracking-wide',
    caption: 'text-xs text-gray-500',
    overline: 'text-[10px] font-bold uppercase tracking-widest',

    // Special
    stat: 'text-2xl font-bold tabular-nums',
    statSmall: 'text-lg font-bold tabular-nums',
    price: 'text-xl font-bold tabular-nums',
    badge: 'text-xs font-semibold',

    // Links
    link: 'text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline',
    linkSubtle: 'text-gray-500 hover:text-gray-700 hover:underline',
} as const;

// Tailwind class compositions for common patterns
export const typography = {
    // Card titles
    cardTitle: 'text-lg font-bold text-gray-800 dark:text-white',
    cardSubtitle: 'text-sm text-gray-500 dark:text-gray-400',

    // Stat cards
    statLabel: 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
    statValue: 'text-xl font-bold text-gray-800 dark:text-white',
    statChange: 'text-xs font-semibold',

    // Form
    inputLabel: 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block',
    inputError: 'text-xs text-red-500 mt-1 font-medium',
    inputHelper: 'text-xs text-gray-400 mt-1',

    // Navigation
    navItem: 'text-sm font-medium',
    navItemActive: 'text-sm font-semibold text-primary-600 dark:text-primary-400',

    // Empty states
    emptyTitle: 'text-xl font-bold text-gray-800 dark:text-white mb-2',
    emptyDescription: 'text-sm text-gray-500 dark:text-gray-400 leading-relaxed',
} as const;
