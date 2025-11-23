import { Controller, Post, Body, UseGuards, BadRequestException, Inject } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AntiCheatService } from '../anticheat/anticheat.service';
import { Model } from 'mongoose';
import { RedisService } from '../redis/redis.service';

@Controller('game')
export class GameController {
    constructor(
        private authService: AuthService,
        private antiCheatService: AntiCheatService,
        private redisService: RedisService,
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

        // Cache valid location in Redis for high-frequency access (e.g. "Nearby Players" feature)
        await this.redisService.setPlayerLocation(data.address, data.currLat, data.currLon);

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
    @Post('pvp/resolve')
    async resolvePvP(@Body() data: any) {
        // 1. Validate Signature
        const isValidSig = await this.authService.validateWeb3Signature(
            data.address,
            data.signature,
            data.message
        );
        if (!isValidSig) throw new BadRequestException('Invalid Signature');

        // 2. Determine Winner (Server-Side Logic)
        // In a real app, this would check player stats, equipment, etc.
        // For MVP, we use a weighted random based on "level" (mocked)
        const playerWinChance = 0.5; // 50/50 base chance
        const isPlayerWinner = Math.random() < playerWinChance;

        const winner = isPlayerWinner ? 'player' : 'opponent';

        // 3. Award Reward if Player Wins
        let reward = null;
        if (isPlayerWinner) {
            reward = {
                itemId: Date.now(),
                type: 'artifact',
                rarity: 'epic',
                value: 500,
                acquiredAt: new Date()
            };

            await this.userModel.updateOne(
                { address: data.address },
                { $push: { inventory: reward } },
                { upsert: true }
            );
        }

        return { success: true, winner, reward };
    }
}
