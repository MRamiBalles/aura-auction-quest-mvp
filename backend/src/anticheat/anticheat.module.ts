import { Module } from '@nestjs/common';
import { AntiCheatService } from './anticheat.service';
import { AntiCheatController } from './anticheat.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [AntiCheatController],
    providers: [AntiCheatService],
    exports: [AntiCheatService]
})
export class AntiCheatModule { }
