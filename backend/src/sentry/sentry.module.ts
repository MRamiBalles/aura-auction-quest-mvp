import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

/**
 * Sentry Monitoring Module for Backend
 * 
 * Features:
 * - Error tracking
 * - Performance monitoring
 * - Security event logging
 * - Custom context for Web3 operations
 */

@Module({})
export class SentryModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Initialize Sentry
        if (process.env.SENTRY_DSN) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: process.env.NODE_ENV || 'development',

                // Performance Monitoring
                tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
                profilesSampleRate: 0.1,

                // Integrations
                integrations: [
                    new ProfilingIntegration(),
                    new Sentry.Integrations.Http({ tracing: true }),
                    new Sentry.Integrations.Express({ app: true }),
                ],

                // Security: Scrub sensitive data
                beforeSend(event) {
                    // Remove sensitive headers
                    if (event.request?.headers) {
                        delete event.request.headers.authorization;
                        delete event.request.headers.cookie;
                    }

                    // Remove private keys and signatures from events
                    if (event.extra) {
                        delete event.extra.privateKey;
                        delete event.extra.signature;
                    }

                    // Scrub wallet addresses from breadcrumbs
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

                // Security event classification
                beforeBreadcrumb(breadcrumb) {
                    // Tag security-related events
                    if (breadcrumb.message?.includes('signature') ||
                        breadcrumb.message?.includes('auth')) {
                        breadcrumb.category = 'security';
                    }

                    if (breadcrumb.message?.includes('cheat') ||
                        breadcrumb.message?.includes('rate limit')) {
                        breadcrumb.category = 'anti-cheat';
                    }

                    return breadcrumb;
                },
            });

            console.log('✅ Sentry monitoring initialized');
        } else {
            console.warn('⚠️  Sentry DSN not configured - monitoring disabled');
        }
    }
}

/**
 * Custom Sentry utilities for Web3 operations
 */
export class SentryWeb3Utils {
    /**
     * Log security events (failed signatures, auth attempts)
     */
    static logSecurityEvent(
        event: 'signature_failed' | 'auth_failed' | 'rate_limit_exceeded' | 'cheat_detected',
        details: {
            address?: string;
            endpoint?: string;
            reason?: string;
            metadata?: Record<string, any>;
        }
    ) {
        Sentry.addBreadcrumb({
            category: 'security',
            message: `Security Event: ${event}`,
            level: 'warning',
            data: {
                event,
                address: details.address?.slice(0, 10) + '...',
                endpoint: details.endpoint,
                reason: details.reason,
                ...details.metadata,
            },
        });

        // Also send as separate event for critical issues
        if (event === 'cheat_detected') {
            Sentry.captureMessage(`Cheat Detected: ${details.reason}`, {
                level: 'warning',
                tags: {
                    type: 'anti-cheat',
                    address: details.address?.slice(0, 10),
                },
                extra: details.metadata,
            });
        }
    }

    /**
     * Log smart contract interactions
     */
    static logContractInteraction(
        contract: 'marketplace' | 'auction' | 'staking',
        function_name: string,
        success: boolean,
        details?: Record<string, any>
    ) {
        Sentry.addBreadcrumb({
            category: 'blockchain',
            message: `Contract: ${contract}.${function_name}`,
            level: success ? 'info' : 'error',
            data: {
                contract,
                function: function_name,
                success,
                ...details,
            },
        });
    }

    /**
     * Track transaction with custom context
     */
    static startTransaction(name: string, op: string) {
        return Sentry.startTransaction({
            name,
            op,
            tags: {
                category: 'web3',
            },
        });
    }

    /**
     * Set user context (anonymized)
     */
    static setUserContext(address: string) {
        Sentry.setUser({
            id: address.slice(0, 10) + '...', // Anonymized
            username: address.slice(0, 10),
        });
    }

    /**
     * Clear user context (on logout)
     */
    static clearUserContext() {
        Sentry.setUser(null);
    }
}

export { Sentry };
