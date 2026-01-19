/**
 * Design System - Spacing & Layout Tokens
 * Consistent spacing values across the app
 */

// Base spacing unit (4px)
const BASE = 4;

export const spacing = {
    0: '0',
    px: '1px',
    0.5: `${BASE * 0.5}px`,   // 2px
    1: `${BASE}px`,            // 4px
    1.5: `${BASE * 1.5}px`,   // 6px
    2: `${BASE * 2}px`,       // 8px
    2.5: `${BASE * 2.5}px`,   // 10px
    3: `${BASE * 3}px`,       // 12px
    3.5: `${BASE * 3.5}px`,   // 14px
    4: `${BASE * 4}px`,       // 16px
    5: `${BASE * 5}px`,       // 20px
    6: `${BASE * 6}px`,       // 24px
    7: `${BASE * 7}px`,       // 28px
    8: `${BASE * 8}px`,       // 32px
    9: `${BASE * 9}px`,       // 36px
    10: `${BASE * 10}px`,     // 40px
    11: `${BASE * 11}px`,     // 44px - Touch target min
    12: `${BASE * 12}px`,     // 48px
    14: `${BASE * 14}px`,     // 56px
    16: `${BASE * 16}px`,     // 64px
    20: `${BASE * 20}px`,     // 80px
    24: `${BASE * 24}px`,     // 96px
} as const;

// Semantic spacing aliases
export const space = {
    // Component padding
    xs: spacing[1],     // 4px
    sm: spacing[2],     // 8px
    md: spacing[4],     // 16px
    lg: spacing[6],     // 24px
    xl: spacing[8],     // 32px
    '2xl': spacing[12], // 48px
    '3xl': spacing[16], // 64px

    // Touch targets (Apple HIG: 44px minimum)
    touchMin: spacing[11],  // 44px
    touchLg: spacing[14],   // 56px

    // Container padding
    container: spacing[4],  // 16px
    containerLg: spacing[6], // 24px

    // Card padding
    card: spacing[5],       // 20px
    cardCompact: spacing[3], // 12px

    // Section gaps
    section: spacing[6],    // 24px
    sectionLg: spacing[10], // 40px
} as const;

// Border radius
export const radius = {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
} as const;

// Shadows
export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    // Colored shadows
    primarySm: '0 4px 14px -3px rgba(37, 99, 235, 0.3)',
    primaryLg: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
    successSm: '0 4px 14px -3px rgba(16, 185, 129, 0.3)',
    dangerSm: '0 4px 14px -3px rgba(239, 68, 68, 0.3)',
} as const;

// Z-index layers
export const zIndex = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    header: 30,
    overlay: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
    max: 9999,
} as const;

// Breakpoints
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// Container max-widths
export const containers = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    prose: '65ch',
} as const;
