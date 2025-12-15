/**
 * LandlordsModule - NestJS module for Landlords backend functionality.
 * 
 * @author Manuel Ramírez Ballesteros
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LandlordsController } from './landlords.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [ConfigModule, RedisModule],
    controllers: [LandlordsController],
})
export class LandlordsModule { }
