import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 🔧 Anti-Cheat SDK - White-Label Export
 * 
 * This service wraps the internal anti-cheat logic for B2B licensing.
 * Game studios integrate this SDK to prevent GPS spoofing.
 * 
 * Pricing: $5,000/month
 */

export interface Location {
    lat: number;
    lon: number;
    timestamp: number;
    accuracy?: number;
}

export interface MovementValidation {
    valid: boolean;
    reason?: 'TELEPORTATION' | 'IMPOSSIBLE_SPEED' | 'GPS_SPOOF_SIGNATURE' | 'ACCURACY_TOO_LOW';
    confidence: number;   // 0-100
    riskScore: number;    // 0-100 (higher = more suspicious)
    details?: string;
}

export interface SDKConfig {
    apiKey: string;
    sensitivity: 'low' | 'medium' | 'high';
    maxSpeedKmh?: number;
    minAccuracyMeters?: number;
}

@Injectable()
export class AntiCheatSDK {
    private readonly logger = new Logger('AntiCheatSDK');

    // Speed limits by sensitivity
    private readonly SPEED_LIMITS = {
        low: 150,      // 150 km/h (allows cars on highways)
        medium: 50,    // 50 km/h (urban movement)
        high: 25       // 25 km/h (walking/running only)
    };

    private config: SDKConfig;

    constructor(config: SDKConfig) {
        this.config = {
            ...config,
            maxSpeedKmh: config.maxSpeedKmh || this.SPEED_LIMITS[config.sensitivity],
            minAccuracyMeters: config.minAccuracyMeters || 50
        };

        this.logger.log(`AntiCheat SDK initialized - Sensitivity: ${config.sensitivity}`);
    }

    /**
     * Validate movement between two locations
     */
    validateMovement(
        previousLocation: Location,
        currentLocation: Location
    ): MovementValidation {
        // Check accuracy
        if (currentLocation.accuracy && currentLocation.accuracy > this.config.minAccuracyMeters!) {
            return {
                valid: false,
                reason: 'ACCURACY_TOO_LOW',
                confidence: 90,
                riskScore: 70,
                details: `GPS accuracy ${currentLocation.accuracy}m exceeds threshold ${this.config.minAccuracyMeters}m`
            };
        }

        // Calculate distance
        const distanceKm = this.haversineDistance(
            previousLocation.lat, previousLocation.lon,
            currentLocation.lat, currentLocation.lon
        );

        // Calculate time difference
        const timeDiffHours = (currentLocation.timestamp - previousLocation.timestamp) / 3600;

        if (timeDiffHours <= 0) {
            return {
                valid: false,
                reason: 'GPS_SPOOF_SIGNATURE',
                confidence: 95,
                riskScore: 95,
                details: 'Invalid timestamp sequence'
            };
        }

        // Calculate speed
        const speedKmh = distanceKm / timeDiffHours;

        // Check for teleportation (instant long-distance movement)
        if (distanceKm > 100 && timeDiffHours < 0.1) {
            return {
                valid: false,
                reason: 'TELEPORTATION',
                confidence: 99,
                riskScore: 100,
                details: `Moved ${distanceKm.toFixed(2)}km in ${(timeDiffHours * 60).toFixed(1)} minutes`
            };
        }

        // Check for impossible speed
        if (speedKmh > this.config.maxSpeedKmh!) {
            return {
                valid: false,
                reason: 'IMPOSSIBLE_SPEED',
                confidence: 85,
                riskScore: Math.min(100, 50 + (speedKmh - this.config.maxSpeedKmh!) * 2),
                details: `Speed ${speedKmh.toFixed(1)} km/h exceeds limit ${this.config.maxSpeedKmh} km/h`
            };
        }

        // Calculate risk score for borderline cases
        const speedRatio = speedKmh / this.config.maxSpeedKmh!;
        const riskScore = Math.min(100, speedRatio * 50);

        return {
            valid: true,
            confidence: 95 - riskScore * 0.5,
            riskScore: Math.round(riskScore),
            details: `Valid movement at ${speedKmh.toFixed(1)} km/h`
        };
    }

    /**
     * Validate a sequence of locations
     */
    validatePath(locations: Location[]): MovementValidation {
        if (locations.length < 2) {
            return { valid: true, confidence: 100, riskScore: 0 };
        }

        let totalRisk = 0;

        for (let i = 1; i < locations.length; i++) {
            const result = this.validateMovement(locations[i - 1], locations[i]);

            if (!result.valid) {
                return result;
            }

            totalRisk += result.riskScore;
        }

        const avgRisk = totalRisk / (locations.length - 1);

        return {
            valid: true,
            confidence: 100 - avgRisk * 0.5,
            riskScore: Math.round(avgRisk),
            details: `Path of ${locations.length} points validated`
        };
    }

    /**
     * Check for GPS spoofing signatures
     */
    detectSpoofSignatures(location: Location, deviceInfo?: {
        hasMockLocationEnabled?: boolean;
        isEmulator?: boolean;
        isRooted?: boolean;
    }): { isSuspicious: boolean; reasons: string[] } {
        const reasons: string[] = [];

        if (deviceInfo?.hasMockLocationEnabled) {
            reasons.push('Mock location enabled on device');
        }

        if (deviceInfo?.isEmulator) {
            reasons.push('Running on emulator');
        }

        if (deviceInfo?.isRooted) {
            reasons.push('Device is rooted/jailbroken');
        }

        // Check for suspiciously perfect coordinates
        const latStr = location.lat.toString();
        const lonStr = location.lon.toString();

        if (latStr.split('.')[1]?.length <= 2 || lonStr.split('.')[1]?.length <= 2) {
            reasons.push('Suspiciously round coordinates');
        }

        return {
            isSuspicious: reasons.length > 0,
            reasons
        };
    }

    /**
     * Haversine formula for distance calculation
     */
    private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

/**
 * Factory function for SDK initialization
 */
export function createAntiCheatSDK(config: SDKConfig): AntiCheatSDK {
    return new AntiCheatSDK(config);
}
