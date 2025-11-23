import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { AuthModule } from '../auth/auth.module';
import { AntiCheatModule } from '../anticheat/anticheat.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [AuthModule, AntiCheatModule, UsersModule],
    controllers: [GameController],
})
export class GameModule { }
