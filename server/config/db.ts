import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/focusflow';

        // Workaround for Bun SRV DNS issues - use direct hosts if SRV fails
        if (mongoUri.startsWith('mongodb+srv://')) {
            console.log('⚠️  SRV connection detected, trying with serverSelectionTimeoutMS...');

            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
            });
        } else {
            await mongoose.connect(mongoUri);
        }

        console.log('✅ MongoDB connected successfully');

        mongoose.connection.on('error', (err: Error) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
