import mongoose from 'mongoose';
import { Task } from '../server/models/Task';

async function runBenchmark() {
    console.log('🚀 Starting Benchmark...');

    try {
        // Attempt to connect (will likely fail in this env)
        await mongoose.connect('mongodb://localhost:27017/focusflow', {
            serverSelectionTimeoutMS: 2000
        });
        console.log('✅ Connected to MongoDB');

        // Setup: Create 1000 tasks if they don't exist
        const count = await Task.countDocuments();
        const userId = new mongoose.Types.ObjectId(); // Use a fixed userId for the benchmark

        if (count < 1000) {
            console.log('📝 Seeding 1000 tasks...');
            const tasks = [];
            const columnId = new mongoose.Types.ObjectId();

            for (let i = 0; i < 1000; i++) {
                tasks.push({
                    userId,
                    columnId,
                    title: `Task ${i}`,
                    date: '2023-01-01',
                    order: i,
                    createdAt: new Date()
                });
            }
            await Task.insertMany(tasks);
        }

        // Benchmark: Run the query 100 times
        // Note: We MUST include userId as it's the prefix of our optimized indices
        console.log('⏱️  Running query benchmark (100 iterations)...');
        const start = performance.now();

        for (let i = 0; i < 100; i++) {
            await Task.find({ userId, date: '2023-01-01' })
                .sort({ order: 1, createdAt: -1 })
                .select('-__v');
        }

        const end = performance.now();
        const duration = end - start;
        console.log(`📊 Total time: ${duration.toFixed(2)}ms`);
        console.log(`📊 Avg per query: ${(duration / 100).toFixed(2)}ms`);

        // Explain Plan (if possible)
        const explanation = await Task.find({ userId, date: '2023-01-01' })
            .sort({ order: 1, createdAt: -1 })
            .explain('executionStats');

        console.log('🔍 Execution Stats:', JSON.stringify(explanation, null, 2));

    } catch (error: any) {
        console.error('❌ Benchmark failed (likely no DB connection):');
        console.error(error.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

runBenchmark();
