import { Injectable } from '@nestjs/common';

@Injectable()
export class AntiCheatService {
    private readonly MAX_SPEED_KMPH = 30; // Max allowed speed (e.g., running/cycling)
    private readonly MAX_DISTANCE_JUMP_METERS = 500; // Max distance between updates

    // Haversine formula to calculate distance between two points in meters
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

    validateMovement(
        prevLat: number, prevLon: number, prevTime: number,
        currLat: number, currLon: number, currTime: number
    ): { valid: boolean; reason?: string } {

        const distance = this.calculateDistance(prevLat, prevLon, currLat, currLon);
        const timeDiffSeconds = (currTime - prevTime) / 1000;

        if (timeDiffSeconds <= 0) return { valid: false, reason: 'Invalid timestamp' };

        // Check 1: Teleportation (Distance Jump)
        if (distance > this.MAX_DISTANCE_JUMP_METERS) {
            return { valid: false, reason: `Teleportation detected: ${distance.toFixed(2)}m jump` };
        }

        // Check 2: Speed Limit
        const speedMps = distance / timeDiffSeconds;
        const speedKmph = speedMps * 3.6;

        if (speedKmph > this.MAX_SPEED_KMPH) {
            return { valid: false, reason: `Speed limit exceeded: ${speedKmph.toFixed(2)} km/h` };
        }

        return { valid: true };
    }
}
