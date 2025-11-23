import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private store: RateLimitStore = {};
    private readonly windowMs: number;
    private readonly maxRequests: number;

    constructor(windowMs: number = 60000, maxRequests: number = 10) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;

        // Cleanup old entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    use(req: Request, res: Response, next: NextFunction) {
        const identifier = this.getIdentifier(req);
        const now = Date.now();

        // Initialize or get existing record
        if (!this.store[identifier] || now > this.store[identifier].resetTime) {
            this.store[identifier] = {
                count: 0,
                resetTime: now + this.windowMs
            };
        }

        const record = this.store[identifier];

        // Check if limit exceeded
        if (record.count >= this.maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.status(429).json({
                statusCode: 429,
                message: 'Too many requests, please try again later',
                retryAfter
            });
            return;
        }

        // Increment counter
        record.count++;

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count));
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

        next();
    }

    private getIdentifier(req: Request): string {
        // Extract wallet address from request body or use IP as fallback
        const address = req.body?.address;
        if (address) {
            return `address:${address.toLowerCase()}`;
        }

        // Fallback to IP address
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        return `ip:${ip}`;
    }

    private cleanup() {
        const now = Date.now();
        Object.keys(this.store).forEach(key => {
            if (now > this.store[key].resetTime + this.windowMs) {
                delete this.store[key];
            }
        });
    }
}

// Factory functions for different rate limits
export function createGameRateLimiter() {
    // For /game/claim: 5 requests per minute
    return new RateLimitMiddleware(60000, 5);
}

export function createPvPRateLimiter() {
    // For /pvp/resolve: 3 requests per minute  
    return new RateLimitMiddleware(60000, 3);
}

export function createGeneralRateLimiter() {
    // For general endpoints: 30 requests per minute
    return new RateLimitMiddleware(60000, 30);
}
