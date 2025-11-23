import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto, BuyListingDto, CancelListingDto } from './dto/marketplace.dto';

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) { }

    @Get('listings')
    async getListings(@Query('activeOnly') activeOnly?: string) {
        const active = activeOnly !== 'false';
        return this.marketplaceService.getListings(active);
    }

    @Get('listings/:id')
    async getListing(@Param('id') id: string) {
        return this.marketplaceService.getListing(parseInt(id));
    }

    @Post('list')
    async createListing(@Body() dto: CreateListingDto) {
        return this.marketplaceService.createListing(
            dto.address,
            dto.nftContract,
            dto.tokenId,
            dto.price,
            dto.signature,
            dto.message,
        );
    }

    @Post('buy')
    async buyListing(@Body() dto: BuyListingDto) {
        return this.marketplaceService.buyListing(
            dto.address,
            dto.listingId,
            dto.amount,
            dto.signature,
            dto.message,
        );
    }

    @Delete('cancel/:id')
    async cancelListing(@Param('id') id: string, @Body() dto: CancelListingDto) {
        return this.marketplaceService.cancelListing(
            dto.address,
            parseInt(id),
            dto.signature,
            dto.message,
        );
    }
}
