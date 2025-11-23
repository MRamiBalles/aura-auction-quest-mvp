import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LeaderboardEntry extends Document {
    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true, default: 0 })
    score: number;

    @Prop({ default: 0 })
    rank: number;

    @Prop({ enum: ['weekly', 'monthly', 'all-time'], required: true })
    period: string;

    @Prop({ default: 0 })
    wins: number;

    @Prop({ default: 0 })
    nftsCollected: number;
}

export const LeaderboardEntrySchema = SchemaFactory.createForClass(LeaderboardEntry);

// Create compound index for efficient queries
LeaderboardEntrySchema.index({ period: 1, rank: 1 });
LeaderboardEntrySchema.index({ period: 1, score: -1 });
