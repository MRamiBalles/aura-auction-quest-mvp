import { AntiCheatSDK, createAntiCheatSDK, SDKConfig } from '../sdk/anti-cheat.sdk';

/**
 * AntiCheatSDK Unit Tests
 * Critical for B2B licensing quality assurance
 */
describe('AntiCheatSDK', () => {
    let sdk: AntiCheatSDK;

    beforeEach(() => {
        const config: SDKConfig = {
            apiKey: 'test-api-key',
            sensitivity: 'medium',
        };
        sdk = createAntiCheatSDK(config);
    });

    describe('validateMovement', () => {
        it('should validate normal walking speed', () => {
            const result = sdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7130, lon: -74.0058, timestamp: 1702600120 } // 2 min later, ~25m
            );

            expect(result.valid).toBe(true);
            expect(result.riskScore).toBeLessThan(50);
        });

        it('should detect teleportation', () => {
            const result = sdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 41.0000, lon: -74.0000, timestamp: 1702600060 } // 1 min, ~32km
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('TELEPORTATION');
            expect(result.riskScore).toBe(100);
        });

        it('should detect impossible speed', () => {
            const result = sdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7200, lon: -74.0000, timestamp: 1702600060 } // 1 min, ~1km = 60km/h
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('IMPOSSIBLE_SPEED');
        });

        it('should reject low GPS accuracy', () => {
            const result = sdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7130, lon: -74.0058, timestamp: 1702600120, accuracy: 200 }
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('ACCURACY_TOO_LOW');
        });

        it('should detect invalid timestamp sequence', () => {
            const result = sdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600100 },
                { lat: 40.7130, lon: -74.0058, timestamp: 1702600000 } // Earlier timestamp
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('GPS_SPOOF_SIGNATURE');
        });
    });

    describe('validatePath', () => {
        it('should validate valid path', () => {
            const locations = [
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7129, lon: -74.0059, timestamp: 1702600060 },
                { lat: 40.7130, lon: -74.0058, timestamp: 1702600120 },
            ];

            const result = sdk.validatePath(locations);
            expect(result.valid).toBe(true);
        });

        it('should detect cheating in path', () => {
            const locations = [
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7129, lon: -74.0059, timestamp: 1702600060 },
                { lat: 41.0000, lon: -74.0000, timestamp: 1702600120 }, // Teleport
            ];

            const result = sdk.validatePath(locations);
            expect(result.valid).toBe(false);
        });

        it('should handle single location', () => {
            const result = sdk.validatePath([
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 }
            ]);
            expect(result.valid).toBe(true);
        });
    });

    describe('detectSpoofSignatures', () => {
        it('should detect mock location enabled', () => {
            const result = sdk.detectSpoofSignatures(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { hasMockLocationEnabled: true }
            );

            expect(result.isSuspicious).toBe(true);
            expect(result.reasons).toContain('Mock location enabled on device');
        });

        it('should detect emulator', () => {
            const result = sdk.detectSpoofSignatures(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { isEmulator: true }
            );

            expect(result.isSuspicious).toBe(true);
            expect(result.reasons).toContain('Running on emulator');
        });

        it('should detect rooted device', () => {
            const result = sdk.detectSpoofSignatures(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { isRooted: true }
            );

            expect(result.isSuspicious).toBe(true);
            expect(result.reasons).toContain('Device is rooted/jailbroken');
        });

        it('should detect suspiciously round coordinates', () => {
            const result = sdk.detectSpoofSignatures(
                { lat: 40.71, lon: -74.00, timestamp: 1702600000 }
            );

            expect(result.isSuspicious).toBe(true);
            expect(result.reasons).toContain('Suspiciously round coordinates');
        });

        it('should pass clean device', () => {
            const result = sdk.detectSpoofSignatures(
                { lat: 40.712856, lon: -74.006015, timestamp: 1702600000 },
                { hasMockLocationEnabled: false, isEmulator: false, isRooted: false }
            );

            expect(result.isSuspicious).toBe(false);
            expect(result.reasons).toHaveLength(0);
        });
    });

    describe('sensitivity levels', () => {
        it('should have stricter limits on high sensitivity', () => {
            const highSdk = createAntiCheatSDK({
                apiKey: 'test',
                sensitivity: 'high'
            });

            // 30 km/h should fail on high (max 25), pass on low
            const result = highSdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.7228, lon: -74.0060, timestamp: 1702600120 } // ~1.1km in 2min = 33km/h
            );

            expect(result.valid).toBe(false);
        });

        it('should have relaxed limits on low sensitivity', () => {
            const lowSdk = createAntiCheatSDK({
                apiKey: 'test',
                sensitivity: 'low'
            });

            // 100 km/h should pass on low (max 150)
            const result = lowSdk.validateMovement(
                { lat: 40.7128, lon: -74.0060, timestamp: 1702600000 },
                { lat: 40.8028, lon: -74.0060, timestamp: 1702600036 } // ~10km in 0.6min = 100km/h
            );

            expect(result.valid).toBe(true);
        });
    });
});
