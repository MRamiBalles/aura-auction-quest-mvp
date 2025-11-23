import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { Guild, GuildSchema } from '../schemas/guild.schema';
import { Friendship, FriendshipSchema } from '../schemas/friendship.schema';
import { LeaderboardEntry, LeaderboardEntrySchema } from '../schemas/leaderboard.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: Guild.name, schema: GuildSchema },
            { name: Friendship.name, schema: FriendshipSchema },
            { name: LeaderboardEntry.name, schema: LeaderboardEntrySchema },
        ]),
    ],
    controllers: [SocialController],
    providers: [SocialService],
    exports: [SocialService],
})
export class SocialModule { }
