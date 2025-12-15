/**
 * Anti-Cheat Service with Server-Side State Tracking
 * 
 * SECURITY: Uses Redis to store last known positions server-side,
 * preventing client-side manipulation of movement history.
 * 
 * @author Security Team
 * @version 2.0.0
 */
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

interface PositionRecord {
    lat: number;
    lon: number;
    timestamp: number;
}

interface MovementValidation {
    valid: boolean;
    reason?: string;
    confidence?: number;
}

@Injectable()
export class AntiCheatService {
    private readonly MAX_SPEED_KMPH = 30; // Max allowed speed (running/cycling)
    private readonly MAX_DISTANCE_JUMP_METERS = 500; // Max distance between updates
    private readonly POSITION_TTL_SECONDS = 3600; // 1 hour TTL for position cache
    private readonly HISTORY_SIZE = 10; // Number of positions to keep for pattern analysis

    constructor(private readonly redisService: RedisService) {}

    /**
     * Haversine formula to calculate distance between two points in meters
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Get last known position from server-side storage
     * SECURITY: Never trust client-provided previous positions
     */
    private async getLastPosition(userId: string): Promise<PositionRecord | null> {
        const data = await this.redisService.get(`position:${userId.toLowerCase()}`);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Save current position to server-side storage
     */
    private async savePosition(userId: string, lat: number, lon: number): Promise<void> {
        const record: PositionRecord = {
            lat,
            lon,
            timestamp: Date.now()
        };
        await this.redisService.set(
            `position:${userId.toLowerCase()}`,
            JSON.stringify(record),
            this.POSITION_TTL_SECONDS
        );

        // Also update position history for pattern analysis
        await this.updatePositionHistory(userId, record);
    }

    /**
     * Maintain a rolling history of positions for pattern analysis
     */
    private async updatePositionHistory(userId: string, record: PositionRecord): Promise<void> {
        const historyKey = `position_history:${userId.toLowerCase()}`;
        const historyData = await this.redisService.get(historyKey);
        const history: PositionRecord[] = historyData ? JSON.parse(historyData) : [];

        history.push(record);

        // Keep only last N positions
        while (history.length > this.HISTORY_SIZE) {
            history.shift();
        }

        await this.redisService.set(
            historyKey,
            JSON.stringify(history),
            this.POSITION_TTL_SECONDS
        );
    }

    /**
     * Get position history for pattern analysis
     */
    private async getPositionHistory(userId: string): Promise<PositionRecord[]> {
        const historyKey = `position_history:${userId.toLowerCase()}`;
        const historyData = await this.redisService.get(historyKey);
        return historyData ? JSON.parse(historyData) : [];
    }

    /**
     * Calculate confidence score based on movement history
     * Low scores indicate suspicious patterns
     */
    private calculateConfidenceScore(
        history: PositionRecord[],
        currentLat: number,
        currentLon: number
    ): number {
        if (history.length < 3) {
            return 0.8; // Not enough data, give benefit of doubt
        }

        let totalScore = 1.0;

        // Check for erratic movement patterns
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];
            const timeDiff = (curr.timestamp - prev.timestamp) / 1000;

            if (timeDiff > 0) {
                const distance = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
                const speedKmph = (distance / timeDiff) * 3.6;

                // Penalize erratic speed changes
                if (speedKmph > 20) {
                    totalScore *= 0.9;
                }
            }
        }

        // Check if current position follows expected trajectory
        const lastPos = history[history.length - 1];
        const expectedDirection = this.calculateBearing(
            history[0].lat, history[0].lon,
            lastPos.lat, lastPos.lon
        );
        const actualDirection = this.calculateBearing(
            lastPos.lat, lastPos.lon,
            currentLat, currentLon
        );

        // Large direction changes are suspicious
        const directionDiff = Math.abs(expectedDirection - actualDirection);
        if (directionDiff > 90 && directionDiff < 270) {
            totalScore *= 0.85;
        }

        return Math.max(0, Math.min(1, totalScore));
    }

    /**
     * Calculate bearing between two points
     */
    private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    /**
     * SERVER-SIDE movement validation
     * 
     * SECURITY: Uses server-stored last position and server timestamp.
     * Client cannot manipulate previous positions or timestamps.
     * 
     * @param userId - Authenticated user ID (from JWT)
     * @param currLat - Current latitude
     * @param currLon - Current longitude
     */
    async validateMovementServerSide(
        userId: string,
        currLat: number,
        currLon: number
    ): Promise<MovementValidation> {
        // Get LAST KNOWN position from SERVER storage (not client)
        const lastPosition = await this.getLastPosition(userId);

        if (!lastPosition) {
            // First position - accept and record
            await this.savePosition(userId, currLat, currLon);
            return { valid: true, confidence: 1.0 };
        }

        // Use SERVER timestamp, not client timestamp
        const currTime = Date.now();
        const timeDiffSeconds = (currTime - lastPosition.timestamp) / 1000;

        if (timeDiffSeconds <= 0) {
            return { valid: false, reason: 'Invalid timestamp sequence' };
        }

        const distance = this.calculateDistance(
            lastPosition.lat, lastPosition.lon,
            currLat, currLon
        );

        // Check 1: Teleportation (Distance Jump)
        if (distance > this.MAX_DISTANCE_JUMP_METERS) {
            return {
                valid: false,
                reason: `Teleportation detected: ${distance.toFixed(0)}m jump in ${timeDiffSeconds.toFixed(0)}s`
            };
        }

        // Check 2: Speed Limit
        const speedMps = distance / timeDiffSeconds;
        const speedKmph = speedMps * 3.6;

        if (speedKmph > this.MAX_SPEED_KMPH) {
            return {
                valid: false,
                reason: `Speed limit exceeded: ${speedKmph.toFixed(1)} km/h`
            };
        }

        // Check 3: Pattern analysis (confidence scoring)
        const history = await this.getPositionHistory(userId);
        const confidence = this.calculateConfidenceScore(history, currLat, currLon);

        if (confidence < 0.5) {
            return {
                valid: false,
                reason: 'Suspicious movement pattern detected',
                confidence
            };
        }

        // All checks passed - update server-side state
        await this.savePosition(userId, currLat, currLon);

        return { valid: true, confidence };
    }

    /**
     * Legacy client-side validation (DEPRECATED - use validateMovementServerSide)
     * Kept for backward compatibility but should not be used for security-critical operations
     * 
     * @deprecated Use validateMovementServerSide instead
     */
    validateMovement(
        prevLat: number, prevLon: number, prevTime: number,
        currLat: number, currLon: number, currTime: number
    ): { valid: boolean; reason?: string } {
        console.warn('SECURITY WARNING: Using deprecated client-side validation. Use validateMovementServerSide instead.');

        const distance = this.calculateDistance(prevLat, prevLon, currLat, currLon);
        const timeDiffSeconds = (currTime - prevTime) / 1000;

        if (timeDiffSeconds <= 0) return { valid: false, reason: 'Invalid timestamp' };

        if (distance > this.MAX_DISTANCE_JUMP_METERS) {
            return { valid: false, reason: `Teleportation detected: ${distance.toFixed(2)}m jump` };
        }

        const speedMps = distance / timeDiffSeconds;
        const speedKmph = speedMps * 3.6;

        if (speedKmph > this.MAX_SPEED_KMPH) {
            return { valid: false, reason: `Speed limit exceeded: ${speedKmph.toFixed(2)} km/h` };
        }

        return { valid: true };
    }
}
