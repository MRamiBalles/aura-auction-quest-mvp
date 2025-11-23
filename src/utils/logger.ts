/**
 * Centralized logger utility for AuraAuction Quest.
 * Prevents sensitive error details from being exposed in production console.
 */

export const logError = (context: string, error: any) => {
    // Check if we are in development mode
    // Vite uses import.meta.env.DEV
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    } else {
        // In production, we would send this to Sentry, LogRocket, or a backend logging service.
        // For now, we suppress the detailed error to avoid exposing internals to end-users.
        console.error(`[${context}] An error occurred. Please contact support.`);
    }
};

export const logInfo = (context: string, message: string) => {
    if (import.meta.env.DEV) {
        console.info(`[${context}] ${message}`);
    }
};
