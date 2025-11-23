import * as mongoose from 'mongoose';

export enum AppRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    HUNTER = 'hunter'
}

export const UserRoleSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' }, // Using address as ID for now
    role: { type: String, enum: Object.values(AppRole), required: true },
    grantedAt: { type: Date, default: Date.now },
    grantedBy: { type: String, ref: 'User' }
});

// Compound index to prevent duplicate roles for the same user
UserRoleSchema.index({ userId: 1, role: 1 }, { unique: true });
