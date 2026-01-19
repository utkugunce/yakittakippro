/**
 * Design System - Animation Tokens
 * Consistent motion and transitions
 */

// Durations
export const duration = {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
} as const;

// Easing functions
export const easing = {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Special easings
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Pre-composed transition classes
export const transitions = {
    // Basic
    default: 'transition-all duration-200 ease-out',
    fast: 'transition-all duration-150 ease-out',
    slow: 'transition-all duration-300 ease-out',

    // Property specific
    opacity: 'transition-opacity duration-200 ease-out',
    transform: 'transition-transform duration-200 ease-out',
    colors: 'transition-colors duration-200 ease-out',
    shadow: 'transition-shadow duration-200 ease-out',

    // Interactive
    button: 'transition-all duration-150 ease-out active:scale-[0.97]',
    link: 'transition-colors duration-150 ease-out',
    card: 'transition-all duration-200 ease-out hover:shadow-lg',
    cardLift: 'transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5',

    // Page transitions
    pageIn: 'animate-in fade-in slide-in-from-bottom-2 duration-500',
    pageOut: 'animate-out fade-out slide-out-to-top-2 duration-300',
    modalIn: 'animate-in fade-in zoom-in-95 duration-200',
    modalOut: 'animate-out fade-out zoom-out-95 duration-150',
} as const;

// Keyframe animations (for CSS)
export const keyframes = {
    fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
    },
    fadeOut: {
        from: { opacity: '1' },
        to: { opacity: '0' },
    },
    slideUp: {
        from: { transform: 'translateY(10px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
        from: { transform: 'translateY(-10px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
    },
    scaleIn: {
        from: { transform: 'scale(0.95)', opacity: '0' },
        to: { transform: 'scale(1)', opacity: '1' },
    },
    pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
    },
    bounce: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10%)' },
    },
    spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
    },
    shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
    },
} as const;

// Animation utility classes
export const animations = {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    ping: 'animate-ping',
    // Custom
    fadeIn: 'animate-in fade-in duration-300',
    fadeOut: 'animate-out fade-out duration-200',
    slideUp: 'animate-in slide-in-from-bottom-2 fade-in duration-300',
    slideDown: 'animate-in slide-in-from-top-2 fade-in duration-300',
    scaleIn: 'animate-in zoom-in-95 fade-in duration-200',
    shimmer: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
} as const;
