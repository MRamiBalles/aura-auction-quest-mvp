import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Friendship extends Document {
    @Prop({ required: true })
    user: string; // wallet address

    @Prop({ required: true })
    friend: string; // wallet address

    @Prop({ enum: ['pending', 'accepted'], default: 'pending' })
    status: string;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Create compound index to prevent duplicate friendships
FriendshipSchema.index({ user: 1, friend: 1 }, { unique: true });
