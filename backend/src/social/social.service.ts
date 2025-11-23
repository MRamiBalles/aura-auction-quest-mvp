import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { verifyMessage } from 'ethers';
import { Guild } from '../schemas/guild.schema';
import { Friendship } from '../schemas/friendship.schema';
import { LeaderboardEntry } from '../schemas/leaderboard.schema';
import { LeaderboardPeriod } from './dto/social.dto';

@Injectable()
export class SocialService {
    constructor(
        @InjectModel(Guild.name) private guildModel: Model<Guild>,
        @InjectModel(Friendship.name) private friendshipModel: Model<Friendship>,
        @InjectModel(LeaderboardEntry.name) private leaderboardModel: Model<LeaderboardEntry>,
    ) { }

    // ========== LEADERBOARD ==========

    async getLeaderboard(period: LeaderboardPeriod, limit: number = 100) {
        return this.leaderboardModel
            .find({ period })
            .sort({ rank: 1 })
            .limit(limit)
            .exec();
    }

    async getUserRank(address: string, period: LeaderboardPeriod) {
        const entry = await this.leaderboardModel
            .findOne({ address: address.toLowerCase(), period })
            .exec();

        return entry || { rank: null, score: 0 };
    }

    // ========== FRIENDS ==========

    async getFriends(address: string) {
        const friendships = await this.friendshipModel
            .find({
                $or: [
                    { user: address.toLowerCase() },
                    { friend: address.toLowerCase() },
                ],
                status: 'accepted',
            })
            .exec();

        return friendships;
    }

    async getPendingRequests(address: string) {
        return this.friendshipModel
            .find({
                friend: address.toLowerCase(),
                status: 'pending',
            })
            .exec();
    }

    async addFriend(
        address: string,
        friendAddress: string,
        signature: string,
        message: string,
    ) {
        // Verify signature
        this.verifySignature(address, signature, message);

        if (address.toLowerCase() === friendAddress.toLowerCase()) {
            throw new BadRequestException('Cannot add yourself as a friend');
        }

        // Check if friendship already exists
        const existing = await this.friendshipModel.findOne({
            $or: [
                { user: address.toLowerCase(), friend: friendAddress.toLowerCase() },
                { user: friendAddress.toLowerCase(), friend: address.toLowerCase() },
            ],
        });

        if (existing) {
            throw new BadRequestException('Friendship request already exists');
        }

        const friendship = new this.friendshipModel({
            user: address.toLowerCase(),
            friend: friendAddress.toLowerCase(),
            status: 'pending',
        });

        return friendship.save();
    }

    async acceptFriend(
        address: string,
        friendshipId: string,
        signature: string,
        message: string,
    ) {
        // Verify signature
        this.verifySignature(address, signature, message);

        const friendship = await this.friendshipModel.findById(friendshipId);

        if (!friendship) {
            throw new NotFoundException('Friendship request not found');
        }

        if (friendship.friend.toLowerCase() !== address.toLowerCase()) {
            throw new BadRequestException('You are not the recipient of this request');
        }

        if (friendship.status === 'accepted') {
            throw new BadRequestException('Friendship already accepted');
        }

        friendship.status = 'accepted';
        return friendship.save();
    }

    async rejectFriend(address: string, friendshipId: string, signature: string, message: string) {
        // Verify signature
        this.verifySignature(address, signature, message);

        const friendship = await this.friendshipModel.findById(friendshipId);

        if (!friendship) {
            throw new NotFoundException('Friendship request not found');
        }

        if (friendship.friend.toLowerCase() !== address.toLowerCase()) {
            throw new BadRequestException('You are not the recipient of this request');
        }

        return friendship.deleteOne();
    }

    // ========== GUILDS ==========

    async getGuilds(limit: number = 50) {
        return this.guildModel
            .find()
            .sort({ totalScore: -1 })
            .limit(limit)
            .exec();
    }

    async getGuild(guildId: string) {
        const guild = await this.guildModel.findById(guildId);
        if (!guild) {
            throw new NotFoundException('Guild not found');
        }
        return guild;
    }

    async getUserGuild(address: string) {
        return this.guildModel
            .findOne({ members: address.toLowerCase() })
            .exec();
    }

    async createGuild(
        address: string,
        name: string,
        description: string,
        signature: string,
        message: string,
    ) {
        // Verify signature
        this.verifySignature(address, signature, message);

        // Check if user is already in a guild
        const existingGuild = await this.getUserGuild(address);
        if (existingGuild) {
            throw new BadRequestException('You are already in a guild');
        }

        // Check if guild name is taken
        const nameTaken = await this.guildModel.findOne({ name });
        if (nameTaken) {
            throw new BadRequestException('Guild name already taken');
        }

        const guild = new this.guildModel({
            name,
            description,
            founder: address.toLowerCase(),
            members: [address.toLowerCase()],
            level: 1,
            totalScore: 0,
            territory: [],
        });

        return guild.save();
    }

    async joinGuild(
        address: string,
        guildId: string,
        signature: string,
        message: string,
    ) {
        // Verify signature
        this.verifySignature(address, signature, message);

        // Check if user is already in a guild
        const existingGuild = await this.getUserGuild(address);
        if (existingGuild) {
            throw new BadRequestException('You are already in a guild');
        }

        const guild = await this.getGuild(guildId);

        // Add member
        guild.members.push(address.toLowerCase());
        return guild.save();
    }

    async leaveGuild(address: string, signature: string, message: string) {
        // Verify signature
        this.verifySignature(address, signature, message);

        const guild = await this.getUserGuild(address);
        if (!guild) {
            throw new BadRequestException('You are not in any guild');
        }

        if (guild.founder.toLowerCase() === address.toLowerCase()) {
            throw new BadRequestException('Guild founder cannot leave (must transfer ownership or disband)');
        }

        // Remove member
        guild.members = guild.members.filter(m => m.toLowerCase() !== address.toLowerCase());
        return guild.save();
    }

    // ========== HELPER ==========

    private verifySignature(address: string, signature: string, message: string): void {
        try {
            const recoveredAddress = verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
                throw new BadRequestException('Invalid signature');
            }
        } catch (error) {
            throw new BadRequestException('Signature verification failed');
        }
    }
}
