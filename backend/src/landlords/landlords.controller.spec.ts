import { Test, TestingModule } from '@nestjs/testing';
import { LandlordsController } from './landlords.controller';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BadRequestException } from '@nestjs/common';

describe('LandlordsController', () => {
    let controller: LandlordsController;
    let configService: ConfigService;

    // Mock private key for testing (random valid key)
    const MOCK_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const MOCK_WALLET = new ethers.Wallet(MOCK_PRIVATE_KEY);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LandlordsController],
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'BACKEND_SIGNER_PRIVATE_KEY') return MOCK_PRIVATE_KEY;
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        controller = module.get<LandlordsController>(LandlordsController);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signClaim', () => {
        it('should generate a valid signature for valid coordinates', async () => {
            const request = {
                userAddress: '0x1234567890123456789012345678901234567890',
                latitude: 40000000,  // 40.0
                longitude: -3000000, // -3.0
            };

            const response = await controller.signClaim(request);

            expect(response).toHaveProperty('signature');
            expect(response).toHaveProperty('message');
            expect(response).toHaveProperty('expiresAt');
            expect(typeof response.signature).toBe('string');
            expect(response.signature.substring(0, 2)).toBe('0x');
        });

        it('should throw BadRequest for invalid user address', async () => {
            const request = {
                userAddress: 'invalid-address',
                latitude: 40000000,
                longitude: -3000000,
            };

            await expect(controller.signClaim(request)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequest for invalid latitude', async () => {
            const request = {
                userAddress: '0x1234567890123456789012345678901234567890',
                latitude: 91000000, // > 90
                longitude: -3000000,
            };

            await expect(controller.signClaim(request)).rejects.toThrow(BadRequestException);
        });
    });
});
