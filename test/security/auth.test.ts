import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../backend/src/auth/auth.service';
import { ethers } from 'ethers';

// Mock dependencies
const mockUserModel = {
    findOne: vi.fn(),
    create: vi.fn(),
};

describe('Security: Authentication', () => {
    let authService: AuthService;
    let testWallet: ethers.Wallet;

    beforeEach(() => {
        authService = new AuthService(mockUserModel as any, {} as any);
        testWallet = ethers.Wallet.createRandom();
    });

    it('should validate a correct Web3 signature', async () => {
        const message = 'Login to AuraAuction';
        const signature = await testWallet.signMessage(message);

        const isValid = await authService.validateWeb3Signature(
            testWallet.address,
            signature,
            message
        );

        expect(isValid).toBe(true);
    });

    it('should reject a signature from a different address', async () => {
        const message = 'Login to AuraAuction';
        const signature = await testWallet.signMessage(message);
        const otherWallet = ethers.Wallet.createRandom();

        const isValid = await authService.validateWeb3Signature(
            otherWallet.address, // Mismatch
            signature,
            message
        );

        expect(isValid).toBe(false);
    });

    it('should reject a tampered message', async () => {
        const message = 'Login to AuraAuction';
        const signature = await testWallet.signMessage(message);

        const isValid = await authService.validateWeb3Signature(
            testWallet.address,
            signature,
            'Tampered Message' // Mismatch
        );

        expect(isValid).toBe(false);
    });

    it('should reject malformed signatures', async () => {
        const isValid = await authService.validateWeb3Signature(
            testWallet.address,
            '0xinvalid',
            'message'
        );
        expect(isValid).toBe(false);
    });
});
