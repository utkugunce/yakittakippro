/**
 * Haptic Feedback Utility
 * Provides tactile feedback for mobile interactions
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticType, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 50, 30, 50, 30]
};

/**
 * Trigger haptic feedback
 * Falls back gracefully on unsupported devices
 */
export function haptic(type: HapticType = 'light'): void {
    try {
        // Check if vibration API is available
        if ('vibrate' in navigator) {
            navigator.vibrate(hapticPatterns[type]);
        }
    } catch (e) {
        // Silently fail on unsupported devices
    }
}

/**
 * Button click feedback
 */
export function hapticClick(): void {
    haptic('light');
}

/**
 * Success action feedback
 */
export function hapticSuccess(): void {
    haptic('success');
}

/**
 * Error/warning feedback
 */
export function hapticError(): void {
    haptic('error');
}
