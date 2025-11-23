import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SocialService } from './social.service';
import {
    AddFriendDto,
    AcceptFriendDto,
    CreateGuildDto,
    JoinGuildDto,
    GetLeaderboardDto,
    LeaderboardPeriod,
} from './dto/social.dto';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
    constructor(private readonly socialService: SocialService) { }

    // ========== LEADERBOARD ==========

    @Get('leaderboard/:period')
    async getLeaderboard(
        @Param('period') period: LeaderboardPeriod,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit) : 100;
        return this.socialService.getLeaderboard(period, limitNum);
    }

    @Get('leaderboard/:period/rank/:address')
    async getUserRank(
        @Param('period') period: LeaderboardPeriod,
        @Param('address') address: string,
    ) {
        return this.socialService.getUserRank(address, period);
    }

    // ========== FRIENDS ==========

    @Get('friends/:address')
    async getFriends(@Param('address') address: string) {
        return this.socialService.getFriends(address);
    }

    @Get('friends/:address/pending')
    async getPendingRequests(@Param('address') address: string) {
        return this.socialService.getPendingRequests(address);
    }

    @Post('friends/add')
    async addFriend(@Body() dto: AddFriendDto) {
        return this.socialService.addFriend(
            dto.address,
            dto.friendAddress,
            dto.signature,
            dto.message,
        );
    }

    @Post('friends/accept')
    async acceptFriend(@Body() dto: AcceptFriendDto) {
        return this.socialService.acceptFriend(
            dto.address,
            dto.friendshipId,
            dto.signature,
            dto.message,
        );
    }

    @Delete('friends/reject/:id')
    async rejectFriend(
        @Param('id') friendshipId: string,
        @Body() dto: { address: string; signature: string; message: string },
    ) {
        return this.socialService.rejectFriend(
            dto.address,
            friendshipId,
            dto.signature,
            dto.message,
        );
    }

    // ========== GUILDS ==========

    @Get('guilds')
    async getGuilds(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.socialService.getGuilds(limitNum);
    }

    @Get('guilds/:id')
    async getGuild(@Param('id') id: string) {
        return this.socialService.getGuild(id);
    }

    @Get('guilds/user/:address')
    async getUserGuild(@Param('address') address: string) {
        return this.socialService.getUserGuild(address);
    }

    @Post('guilds/create')
    async createGuild(@Body() dto: CreateGuildDto) {
        return this.socialService.createGuild(
            dto.address,
            dto.name,
            dto.description,
            dto.signature,
            dto.message,
        );
    }

    @Post('guilds/join')
    async joinGuild(@Body() dto: JoinGuildDto) {
        return this.socialService.joinGuild(
            dto.address,
            dto.guildId,
            dto.signature,
            dto.message,
        );
    }

    @Delete('guilds/leave')
    async leaveGuild(@Body() dto: { address: string; signature: string; message: string }) {
        return this.socialService.leaveGuild(dto.address, dto.signature, dto.message);
    }
}
