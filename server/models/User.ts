import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    googleId?: string;
    email: string;
    name: string;
    password?: string; // Hashed password for email/pass auth
    avatarUrl?: string;
    role: string;
    isEmailVerified: boolean;
    verificationToken?: string;
    verificationExpires?: Date;
    otp?: string;
    otpExpires?: Date;
    preferences: {
        darkMode: boolean;
        emailNotifications: boolean;
        pushNotifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    googleId: {
        type: String,
        sparse: true, // Allow null but unique when present
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String // Only set for email/password users
    },
    avatarUrl: {
        type: String
    },
    role: {
        type: String,
        default: 'User'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationExpires: {
        type: Date
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    preferences: {
        darkMode: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);

