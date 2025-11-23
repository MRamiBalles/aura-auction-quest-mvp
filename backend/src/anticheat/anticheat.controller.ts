import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AntiCheatService } from './anticheat.service';

@Controller('anticheat')
export class AntiCheatController {
    constructor(private readonly antiCheatService: AntiCheatService) { }

    @Post('validate-move')
    validateMove(@Body() body: {
        prevLat: number; prevLon: number; prevTime: number;
        currLat: number; currLon: number; currTime: number;
    }) {
        const result = this.antiCheatService.validateMovement(
            body.prevLat, body.prevLon, body.prevTime,
            body.currLat, body.currLon, body.currTime
        );

        if (!result.valid) {
            throw new BadRequestException(result.reason);
        }

        return { status: 'valid', timestamp: new Date().toISOString() };
    }
}
