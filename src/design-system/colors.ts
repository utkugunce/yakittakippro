/**
 * Design System - Color Tokens
 * Consistent color palette for TripBook app
 */

export const colors = {
    // Primary - Blue (Default theme)
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },

    // Gray - Neutral colors
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Semantic Colors
    success: {
        light: '#d1fae5',
        DEFAULT: '#10b981',
        dark: '#059669',
    },
    warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#d97706',
    },
    danger: {
        light: '#fee2e2',
        DEFAULT: '#ef4444',
        dark: '#dc2626',
    },
    info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#2563eb',
    },

    // Fuel Types
    fuel: {
        benzin: '#f97316',    // Orange
        dizel: '#0ea5e9',     // Sky blue
        lpg: '#22c55e',       // Green
        elektrik: '#8b5cf6',  // Purple
    },

    // Accent Colors for Themes
    themes: {
        blue: { primary: '#2563eb', light: '#eff6ff' },
        green: { primary: '#16a34a', light: '#f0fdf4' },
        purple: { primary: '#9333ea', light: '#faf5ff' },
        orange: { primary: '#ea580c', light: '#fff7ed' },
        red: { primary: '#dc2626', light: '#fef2f2' },
        violet: { primary: '#6d28d9', light: '#f5f3ff' },
    },

    // Gradients
    gradients: {
        primary: 'from-blue-600 to-indigo-600',
        success: 'from-emerald-500 to-teal-600',
        warning: 'from-amber-400 to-orange-500',
        danger: 'from-red-500 to-rose-600',
        premium: 'from-purple-600 to-pink-600',
        sunset: 'from-orange-500 to-pink-500',
        ocean: 'from-cyan-500 to-blue-600',
    },
} as const;

export type ColorTheme = keyof typeof colors.themes;
export type FuelType = keyof typeof colors.fuel;
