import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * MarketplaceService Unit Tests
 * Target: 80% coverage for Q1 2026 roadmap
 */
describe('MarketplaceService', () => {
    let service: MarketplaceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MarketplaceService],
        }).compile();

        service = module.get<MarketplaceService>(MarketplaceService);
    });

    describe('getListings', () => {
        it('should return empty array initially', async () => {
            const listings = await service.getListings(true);
            expect(listings).toEqual([]);
        });

        it('should return all listings when activeOnly is false', async () => {
            const listings = await service.getListings(false);
            expect(Array.isArray(listings)).toBe(true);
        });
    });

    describe('getListing', () => {
        it('should throw NotFoundException for non-existent listing', async () => {
            await expect(service.getListing(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createListing', () => {
        const validAddress = '0x1234567890123456789012345678901234567890';
        const validSignature = '0x' + 'a'.repeat(130);
        const message = 'Create listing';

        it('should throw BadRequestException for invalid signature', async () => {
            await expect(
                service.createListing(
                    validAddress,
                    '0xNFTContract',
                    1,
                    100,
                    'invalid-signature',
                    message
                )
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('buyListing', () => {
        it('should throw NotFoundException when listing does not exist', async () => {
            const buyer = '0x1234567890123456789012345678901234567890';

            await expect(
                service.buyListing(buyer, 999, 100, 'sig', 'msg')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('cancelListing', () => {
        it('should throw NotFoundException for non-existent listing', async () => {
            const seller = '0x1234567890123456789012345678901234567890';

            await expect(
                service.cancelListing(seller, 999, 'sig', 'msg')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('invalidateListing', () => {
        it('should return false for non-existent listing', async () => {
            const result = await service.invalidateListing(999);
            expect(result).toBe(false);
        });
    });

    describe('getListingsByNFT', () => {
        it('should return empty array for unknown NFT', () => {
            const result = service.getListingsByNFT('0xUnknown', 1);
            expect(result).toEqual([]);
        });
    });
});
