import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        // MongooseModule.forFeature([{ name: 'Listing', schema: ListingSchema }]),
    ],
    controllers: [MarketplaceController],
    providers: [MarketplaceService],
    exports: [MarketplaceService],
})
export class MarketplaceModule { }
