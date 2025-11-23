import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    username: { type: String },
    roles: { type: [String], default: ['hunter'] },
    createdAt: { type: Date, default: Date.now },
    inventory: [{
        itemId: Number,
        type: String,
        rarity: String,
        value: Number,
        acquiredAt: Date
    }]
});
