import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { ListingCleanupService } from './listing-cleanup.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        ConfigModule,
        // MongooseModule.forFeature([{ name: 'Listing', schema: ListingSchema }]),
    ],
    controllers: [MarketplaceController],
    providers: [MarketplaceService, ListingCleanupService],
    exports: [MarketplaceService, ListingCleanupService],
})
export class MarketplaceModule { }

