/**
 * LandlordsModule - NestJS module for Landlords backend functionality.
 * 
 * @author Manuel Ramírez Ballesteros
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LandlordsController } from './landlords.controller';

@Module({
    imports: [ConfigModule],
    controllers: [LandlordsController],
})
export class LandlordsModule { }
