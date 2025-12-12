/**
 * Performance utilities for low-end device detection and optimization
 */

/**
 * Throttle function calls to a maximum frequency
 * Useful for expensive operations like mouse tracking
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                func(...args);
                timeoutId = null;
            }, delay - (now - lastCall));
        }
    };
}

/**
 * Detect if device is low-end based on hardware specs
 * Returns true for devices with limited CPU/memory
 */
export function isLowEndDevice(): boolean {
    // Check for hardware concurrency (CPU cores)
    // Low-end devices typically have <= 4 cores
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
        return true;
    }

    // Check for device memory (requires HTTPS and Chrome/Edge)
    // Low-end devices typically have <= 4GB RAM
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory <= 4) {
        return true;
    }

    // Fallback: assume not low-end if we can't detect
    return false;
}
