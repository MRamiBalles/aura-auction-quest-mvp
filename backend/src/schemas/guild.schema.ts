import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Guild extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    founder: string; // wallet address

    @Prop({ type: [String], default: [] })
    members: string[]; // array of wallet addresses

    @Prop({ default: 1 })
    level: number;

    @Prop({
        type: [{
            lat: Number,
            lon: Number,
            radius: Number
        }],
        default: []
    })
    territory: Array<{ lat: number; lon: number; radius: number }>;

    @Prop({ default: '' })
    emblem: string; // URL or base64 image

    @Prop({ default: 0 })
    totalScore: number;
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
