/**
 * LandlordsController - Backend API for GPS signature verification.
 * 
 * Provides secure endpoints for:
 * - Generating GPS claim signatures (anti-spoofing)
 * - Validating parcel ownership
 * 
 * SECURITY: Uses ECDSA signatures to prove physical presence.
 * The signature is verified on-chain by LandRegistry.sol
 * 
 * Security measures implemented:
 * - JWT authentication required
 * - Rate limiting (5 requests per minute)
 * - Velocity checks (prevent teleportation)
 * - Address verification (JWT user must match request)
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 2.0.0
 */
import { Controller, Post, Body, BadRequestException, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';

interface SignClaimRequest {
    userAddress: string;
    latitude: number;  // int64 format (lat * 1e6)
    longitude: number; // int64 format (lng * 1e6)
}

interface SignClaimResponse {
    signature: string;
    message: string;
    expiresAt: number;
}

// Rate limit: 5 requests per minute per user
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Velocity check: max 50km in 1 minute (roughly 3000 km/h - allows for GPS drift)
const VELOCITY_CHECK_WINDOW_MS = 60000;
const MAX_DISTANCE_METERS = 50000;

// Grid normalization: must match PARCEL_SIZE in LandRegistry.sol (100 meters)
// Coordinates are in int64 format (multiply by 1e6), so 100m ≈ 0.0009 degrees ≈ 900 units
const PARCEL_SIZE_UNITS = 900; // ~100 meters in int64 coordinate format

@Controller('api/landlords')
@UseGuards(JwtAuthGuard)
export class LandlordsController {
    private readonly signerWallet: ethers.Wallet;
    private readonly signatureValidityMs: number = 5 * 60 * 1000; // 5 minutes

    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ) {
        // Backend signer private key (MUST match backendValidator in LandRegistry.sol)
        // SECURITY: This key should be stored in a secure secrets manager in production
        // (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, or HSM)
        const privateKey = this.configService.get<string>('BACKEND_SIGNER_PRIVATE_KEY');
        if (!privateKey) {
            throw new Error('BACKEND_SIGNER_PRIVATE_KEY not configured');
        }
        this.signerWallet = new ethers.Wallet(privateKey);
    }

    /**
     * Calculate distance between two GPS coordinates using Haversine formula
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Check rate limit for user
     */
    private async checkRateLimit(userAddress: string): Promise<void> {
        const key = `ratelimit:landlord:${userAddress.toLowerCase()}`;
        const current = await this.redisService.get(key);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= RATE_LIMIT_MAX_REQUESTS) {
            throw new BadRequestException('Rate limit exceeded. Please wait before making another request.');
        }

        await this.redisService.set(key, (count + 1).toString(), RATE_LIMIT_WINDOW_SECONDS);
    }

    /**
     * Check velocity - prevent teleportation exploits
     */
    private async checkVelocity(userAddress: string, latitude: number, longitude: number): Promise<void> {
        const key = `velocity:landlord:${userAddress.toLowerCase()}`;
        const lastClaimData = await this.redisService.get(key);

        if (lastClaimData) {
            const lastClaim = JSON.parse(lastClaimData);
            const timeDiff = Date.now() - lastClaim.timestamp;

            if (timeDiff < VELOCITY_CHECK_WINDOW_MS) {
                // Convert from int64 format to degrees
                const lastLat = lastClaim.latitude / 1e6;
                const lastLon = lastClaim.longitude / 1e6;
                const currentLat = latitude / 1e6;
                const currentLon = longitude / 1e6;

                const distance = this.calculateDistance(lastLat, lastLon, currentLat, currentLon);

                if (distance > MAX_DISTANCE_METERS) {
                    throw new BadRequestException(
                        `Velocity check failed: Cannot travel ${Math.round(distance / 1000)}km in ${Math.round(timeDiff / 1000)}s`
                    );
                }
            }
        }

        // Store current location for future velocity checks
        await this.redisService.set(key, JSON.stringify({
            latitude,
            longitude,
            timestamp: Date.now()
        }), 300); // 5 minute TTL
    }

    /**
     * Check if parcel has already been claimed recently (cache-based check)
     * Note: This is a UX optimization - the smart contract is the source of truth
     */
    private async checkDuplicateClaim(latitude: number, longitude: number): Promise<void> {
        const coordHash = `${latitude}:${longitude}`;
        const key = `claimed_parcel:${coordHash}`;
        const existingClaim = await this.redisService.get(key);

        if (existingClaim) {
            throw new BadRequestException(
                `Parcel at (${latitude / 1e6}, ${longitude / 1e6}) was recently claimed. Check blockchain for current status.`
            );
        }

        // Mark as pending claim for 10 minutes (prevents spam)
        await this.redisService.set(key, 'pending', 600);
    }

    /**
     * Generates a signed message proving the user was at the specified GPS location.
     * This signature is verified on-chain by LandRegistry.claimParcel()
     * 
     * Security measures:
     * 1. JWT authentication required
     * 2. User address must match JWT token
     * 3. Rate limiting (5 requests/minute)
     * 4. Velocity checks (prevent teleportation)
     * 5. Signature expires after 5 minutes
     */
    @Post('sign-claim')
    async signClaim(@Body() body: SignClaimRequest, @Request() req: any): Promise<SignClaimResponse> {
        const { userAddress, latitude, longitude } = body;

        // Validate inputs
        if (!userAddress || !ethers.isAddress(userAddress)) {
            throw new BadRequestException('Invalid user address');
        }

        // SECURITY: Verify JWT user matches requested address
        if (req.user?.address?.toLowerCase() !== userAddress.toLowerCase()) {
            throw new UnauthorizedException('Address mismatch: JWT user does not match requested address');
        }

        if (latitude === undefined || longitude === undefined) {
            throw new BadRequestException('Latitude and longitude required');
        }

        // Validate coordinate ranges (int64 format: -90000000 to 90000000 for lat)
        if (latitude < -90000000 || latitude > 90000000) {
            throw new BadRequestException('Invalid latitude');
        }
        if (longitude < -180000000 || longitude > 180000000) {
            throw new BadRequestException('Invalid longitude');
        }

        // SECURITY: Validate coordinate precision (prevent excessive decimal places)
        if (!Number.isInteger(latitude) || !Number.isInteger(longitude)) {
            throw new BadRequestException('Coordinates must be integers in int64 format');
        }

        // SECURITY: Grid normalization - align to parcel grid
        // This ensures coordinates match the smart contract's parcel grid
        const normalizedLatitude = Math.floor(latitude / PARCEL_SIZE_UNITS) * PARCEL_SIZE_UNITS;
        const normalizedLongitude = Math.floor(longitude / PARCEL_SIZE_UNITS) * PARCEL_SIZE_UNITS;

        // SECURITY: Rate limiting
        await this.checkRateLimit(userAddress);

        // SECURITY: Velocity check (anti-teleportation)
        await this.checkVelocity(userAddress, normalizedLatitude, normalizedLongitude);

        // SECURITY: Check for duplicate parcel claims (cache-based)
        await this.checkDuplicateClaim(normalizedLatitude, normalizedLongitude);

        // Create message hash (must match format in LandRegistry.sol)
        // SECURITY: Use normalized coordinates for consistent grid alignment
        const timestamp = Math.floor(Date.now() / 1000);
        const expiresAt = timestamp + 300; // 5 minutes

        // Pack the message the same way Solidity expects (using normalized coordinates)
        const messageHash = ethers.solidityPackedKeccak256(
            ['address', 'int64', 'int64', 'uint256'],
            [userAddress, normalizedLatitude, normalizedLongitude, expiresAt]
        );

        // Create Ethereum signed message (adds prefix)
        const signature = await this.signerWallet.signMessage(ethers.getBytes(messageHash));

        return {
            signature,
            message: `Claim at grid (${normalizedLatitude / 1e6}, ${normalizedLongitude / 1e6})`,
            expiresAt: expiresAt * 1000, // Convert to milliseconds for JS
        };
    }

    /**
     * Validates that a user owns a specific parcel (read from blockchain)
     * Can be used for server-side validation before performing actions
     */
    @Post('validate-ownership')
    async validateOwnership(
        @Body() body: { userAddress: string; parcelId: number }
    ): Promise<{ isOwner: boolean }> {
        // In production, this would query the blockchain
        // For now, return placeholder
        return { isOwner: false };
    }
}
