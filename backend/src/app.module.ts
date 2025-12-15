import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AntiCheatModule } from './anticheat/anticheat.module';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { SocialModule } from './social/social.module';
import { LandlordsModule } from './landlords/landlords.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        AntiCheatModule,
        GameModule,
        RedisModule,
        MarketplaceModule,
        SocialModule,
        LandlordsModule,
        AnalyticsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

