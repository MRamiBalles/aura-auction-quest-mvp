import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AntiCheatService } from '../anticheat/anticheat.service';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';

@Controller('game')
export class GameController {
    constructor(
        private authService: AuthService,
        private antiCheatService: AntiCheatService,
        @Inject('USER_MODEL') private userModel: Model<any>,
    ) { }

    @Post('claim')
    async claimReward(@Body() data: any) {
        // 1. Validate Signature (Proof of Identity)
        // In a real app, use a Guard. For MVP, manual check to match user's request.
        const isValidSig = await this.authService.validateWeb3Signature(
            data.address,
            data.signature,
            data.message
        );
        if (!isValidSig) throw new BadRequestException('Invalid Signature');

        // 2. Validate Movement (Anti-Cheat)
        const movementValid = this.antiCheatService.validateMovement(
            data.prevLat, data.prevLon, data.prevTime,
            data.currLat, data.currLon, data.currTime
        );

        if (!movementValid.valid) {
            throw new BadRequestException(`Cheating Detected: ${movementValid.reason}`);
        }

        // 3. Award Reward (Update Inventory)
        // Add a random crystal to the user's inventory
        const crystal = {
            itemId: Date.now(),
            type: 'crystal',
            rarity: Math.random() > 0.9 ? 'legendary' : 'common',
            value: 100,
            acquiredAt: new Date()
        };

        await this.userModel.updateOne(
            { address: data.address },
            { $push: { inventory: crystal } },
            { upsert: true }
        );

        return { success: true, reward: crystal };
    }
}
