import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccountAbstractionService } from '../auth/account-abstraction.service';

/**
 * AccountAbstractionService Unit Tests
 */
describe('AccountAbstractionService', () => {
    let service: AccountAbstractionService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountAbstractionService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(null), // No config for unit tests
                    },
                },
            ],
        }).compile();

        service = module.get<AccountAbstractionService>(AccountAbstractionService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('generateSalt', () => {
        it('should generate deterministic salt from userId', () => {
            const salt1 = service.generateSalt('user123');
            const salt2 = service.generateSalt('user123');
            const salt3 = service.generateSalt('user456');

            expect(salt1).toBe(salt2); // Same input = same output
            expect(salt1).not.toBe(salt3); // Different input = different output
            expect(salt1).toMatch(/^0x[a-f0-9]{64}$/); // Valid keccak256 hash
        });
    });

    describe('computeAccountAddress', () => {
        it('should return null when factory not configured', async () => {
            const result = await service.computeAccountAddress('user123');
            expect(result).toBeNull();
        });
    });

    describe('createSmartAccount', () => {
        it('should return error when factory not configured', async () => {
            const result = await service.createSmartAccount('user123');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Factory not configured');
        });
    });

    describe('checkSponsorshipEligibility', () => {
        it('should return not configured when paymaster missing', async () => {
            const result = await service.checkSponsorshipEligibility(
                '0x1234',
                '0x12345678'
            );
            expect(result.eligible).toBe(false);
            expect(result.reason).toBe('Paymaster not configured');
        });
    });

    describe('getUserSponsorshipStatus', () => {
        it('should return null when paymaster not configured', async () => {
            const result = await service.getUserSponsorshipStatus('0x1234');
            expect(result).toBeNull();
        });
    });

    describe('recordSponsorship', () => {
        it('should return false when paymaster not configured', async () => {
            const result = await service.recordSponsorship('0x1234', 21000);
            expect(result).toBe(false);
        });
    });

    describe('executeForUser', () => {
        it('should return error when service not configured', async () => {
            const result = await service.executeForUser(
                '0xSmartAccount',
                '0xTarget',
                '0xCalldata'
            );
            expect(result.success).toBe(false);
            expect(result.error).toBe('Service not configured');
        });
    });

    describe('getDailyBudgetStatus', () => {
        it('should return null when paymaster not configured', async () => {
            const result = await service.getDailyBudgetStatus();
            expect(result).toBeNull();
        });
    });
});
