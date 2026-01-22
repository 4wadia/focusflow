import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IColumn extends Document {
    userId: Types.ObjectId;
    title: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const columnSchema = new Schema<IColumn>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for user's columns
columnSchema.index({ userId: 1, order: 1 });

export const Column = mongoose.model<IColumn>('Column', columnSchema);
