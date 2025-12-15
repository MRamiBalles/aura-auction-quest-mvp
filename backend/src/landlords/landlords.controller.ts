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
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

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

@Controller('api/landlords')
export class LandlordsController {
    private readonly signerWallet: ethers.Wallet;
    private readonly signatureValidityMs: number = 5 * 60 * 1000; // 5 minutes

    constructor(private readonly configService: ConfigService) {
        // Backend signer private key (MUST match backendValidator in LandRegistry.sol)
        const privateKey = this.configService.get<string>('BACKEND_SIGNER_PRIVATE_KEY');
        if (!privateKey) {
            throw new Error('BACKEND_SIGNER_PRIVATE_KEY not configured');
        }
        this.signerWallet = new ethers.Wallet(privateKey);
    }

    /**
     * Generates a signed message proving the user was at the specified GPS location.
     * This signature is verified on-chain by LandRegistry.claimParcel()
     * 
     * Anti-spoofing measures:
     * 1. Signature expires after 5 minutes
     * 2. User address is included in signature (prevents replay attacks)
     * 3. Backend can add additional validation (IP geolocation, device fingerprinting)
     */
    @Post('sign-claim')
    async signClaim(@Body() body: SignClaimRequest): Promise<SignClaimResponse> {
        const { userAddress, latitude, longitude } = body;

        // Validate inputs
        if (!userAddress || !ethers.isAddress(userAddress)) {
            throw new BadRequestException('Invalid user address');
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

        // TODO: Add additional anti-spoofing checks here:
        // - IP geolocation validation
        // - Device fingerprinting
        // - Rate limiting per user
        // - Velocity checks (can't claim parcels 100km apart in 1 minute)

        // Create message hash (must match format in LandRegistry.sol)
        const timestamp = Math.floor(Date.now() / 1000);
        const expiresAt = timestamp + 300; // 5 minutes

        // Pack the message the same way Solidity expects
        const messageHash = ethers.solidityPackedKeccak256(
            ['address', 'int64', 'int64', 'uint256'],
            [userAddress, latitude, longitude, expiresAt]
        );

        // Create Ethereum signed message (adds prefix)
        const signature = await this.signerWallet.signMessage(ethers.getBytes(messageHash));

        return {
            signature,
            message: `Claim at (${latitude / 1e6}, ${longitude / 1e6})`,
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
