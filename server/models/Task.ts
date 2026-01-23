import mongoose, { Schema, Document, Types } from 'mongoose';

export type Priority = 'High' | 'Medium' | 'Low' | 'Completed';

export interface ISubtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface ITask extends Document {
    userId: Types.ObjectId;
    columnId: Types.ObjectId;
    title: string;
    duration?: string;
    dueTime?: string;
    date: string;
    priority: Priority;
    isCompleted: boolean;
    order: number;
    subtasks: ISubtask[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    columnId: {
        type: Schema.Types.ObjectId,
        ref: 'Column',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    duration: {
        type: String  // e.g., "30m", "1h 30m"
    },
    dueTime: {
        type: String  // e.g., "2:30 PM"
    },
    date: {
        type: String,  // YYYY-MM-DD format
        required: true,
        index: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low', 'Completed'],
        default: 'Medium'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    subtasks: [{
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 200 },
        completed: { type: Boolean, default: false }
    }],
    tags: [{ type: String, trim: true, maxlength: 30 }]
}, {
    timestamps: true
});

// Compound index for efficient queries
taskSchema.index({ userId: 1, date: 1, priority: 1 });
taskSchema.index({ userId: 1, columnId: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
