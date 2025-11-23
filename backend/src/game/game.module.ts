import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { GameController } from './game.controller';
import { AuthModule } from '../auth/auth.module';
import { AntiCheatModule } from '../anticheat/anticheat.module';
import { UsersModule } from '../users/users.module';
import { createGameRateLimiter, createPvPRateLimiter } from '../middleware/rate-limit.middleware';

@Module({
    imports: [AuthModule, AntiCheatModule, UsersModule],
    controllers: [GameController],
})
export class GameModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply rate limiting to game endpoints
        consumer
            .apply(createGameRateLimiter())
            .forRoutes({ path: 'game/claim', method: RequestMethod.POST });

        consumer
            .apply(createPvPRateLimiter())
            .forRoutes({ path: 'game/pvp/resolve', method: RequestMethod.POST });
    }
}
