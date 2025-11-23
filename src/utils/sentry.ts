import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

/**
 * Sentry Configuration for React Frontend
 * 
 * Features:
 * - Error boundary
 * - Performance monitoring
 * - Web3 error tracking
 * - User session replay
 */

export function initSentry() {
    if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,

            // Performance Monitoring
            integrations: [
                new BrowserTracing({
                    // Trace all route changes
                    routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                        React.useEffect,
                        useLocation,
                        useNavigationType,
                        createRoutesFromChildren,
                        matchRoutes
                    ),
                }),
                new Sentry.Replay({
                    // Session Replay for debugging
                    maskAllText: true, // Privacy: mask all text
                    blockAllMedia: true, // Privacy: block all media
                }),
            ],

            // Sampling rates
            tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
            replaysSessionSampleRate: 0.1, // 10% of sessions
            replaysOnErrorSampleRate: 1.0, // 100% of errors get replay

            // Scrub sensitive data
            beforeSend(event, hint) {
                // Remove wallet private keys, signatures
                if (event.extra) {
                    delete event.extra.privateKey;
                    delete event.extra.mnemonic;
                    delete event.extra.signature;
                }

                // Scrub sensitive headers
                if (event.request?.headers) {
                    delete event.request.headers.authorization;
                }

                // Anonymize wallet addresses in breadcrumbs
                if (event.breadcrumbs) {
                    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                        if (breadcrumb.data?.address) {
                            breadcrumb.data.address = breadcrumb.data.address.slice(0, 10) + '...';
                        }
                        return breadcrumb;
                    });
                }

                return event;
            },

            // Ignore common errors
            ignoreErrors: [
                // Browser extensions
                'ResizeObserver loop limit exceeded',
                'Non-Error promise rejection captured',
                // MetaMask
                'User rejected the request',
                'User denied transaction signature',
            ],
        });

        console.log('✅ Sentry initialized');
    } else {
        console.warn('⚠️  Sentry DSN not configured');
    }
}

/**
 * Web3 Error Tracking Utilities
 */
export class SentryWeb3 {
    /**
     * Track wallet connection
     */
    static trackWalletConnection(address: string, success: boolean, error?: any) {
        Sentry.addBreadcrumb({
            category: 'wallet',
            message: `Wallet connection ${success ? 'successful' : 'failed'}`,
            level: success ? 'info' : 'error',
            data: {
                address: address?.slice(0, 10) + '...',
                success,
                error: error?.message,
            },
        });

        if (!success && error) {
            Sentry.captureException(error, {
                tags: { type: 'wallet_connection' },
            });
        }
    }

    /**
     * Track transaction
     */
    static trackTransaction(
        type: 'marketplace' | 'auction' | 'staking',
        action: string,
        txHash?: string,
        error?: any
    ) {
        const success = !error;

        Sentry.addBreadcrumb({
            category: 'blockchain',
            message: `Transaction: ${type}.${action}`,
            level: success ? 'info' : 'error',
            data: {
                type,
                action,
                txHash,
                success,
            },
        });

        if (error) {
            Sentry.captureException(error, {
                tags: {
                    type: 'transaction',
                    contract: type,
                    action,
                },
                extra: {
                    txHash,
                },
            });
        }
    }

    /**
     * Track signature request
     */
    static trackSignature(purpose: string, success: boolean, error?: any) {
        Sentry.addBreadcrumb({
            category: 'web3',
            message: `Signature: ${purpose}`,
            level: success ? 'info' : 'warning',
            data: {
                purpose,
                success,
            },
        });

        if (!success && error) {
            Sentry.captureMessage(`Signature failed: ${purpose}`, {
                level: 'warning',
                tags: { type: 'signature' },
                extra: { error: error.message },
            });
        }
    }

    /**
     * Set user context
     */
    static setUserContext(address: string) {
        Sentry.setUser({
            id: address.slice(0, 10) + '...',
            username: address.slice(0, 10),
        });
    }

    /**
     * Clear user context
     */
    static clearUserContext() {
        Sentry.setUser(null);
    }

    /**
     * Track API error
     */
    static trackAPIError(endpoint: string, error: any) {
        Sentry.captureException(error, {
            tags: {
                type: 'api_error',
                endpoint,
            },
        });
    }
}

/**
 * Error Boundary Component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
