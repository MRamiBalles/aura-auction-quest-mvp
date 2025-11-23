import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

/**
 * Sentry Error Interceptor
 * Automatically captures all errors and sends them to Sentry
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;

        // Start transaction for performance monitoring
        const transaction = Sentry.startTransaction({
            op: 'http.server',
            name: `${method} ${url}`,
            tags: {
                method,
                url,
            },
        });

        // Set user context if authenticated
        if (user?.address) {
            Sentry.setUser({
                id: user.address.slice(0, 10) + '...',
                username: user.address.slice(0, 10),
            });
        }

        return next.handle().pipe(
            tap(() => {
                // Success - finish transaction
                transaction.setStatus('ok');
                transaction.finish();
            }),
            catchError((error) => {
                // Error occurred - capture in Sentry
                Sentry.captureException(error, {
                    tags: {
                        method,
                        url,
                        statusCode: error.status || 500,
                    },
                    extra: {
                        body: request.body,
                        params: request.params,
                        query: request.query,
                    },
                    level: this.getErrorLevel(error.status),
                });

                transaction.setStatus('internal_error');
                transaction.finish();

                return throwError(() => error);
            }),
        );
    }

    private getErrorLevel(statusCode: number): Sentry.SeverityLevel {
        if (statusCode >= 500) return 'error';
        if (statusCode >= 400) return 'warning';
        return 'info';
    }
}
