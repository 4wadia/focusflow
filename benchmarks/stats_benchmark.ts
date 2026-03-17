import { Types } from 'mongoose';

// Simulation constants
const NETWORK_LATENCY = 20; // ms
const DB_SCAN_TIME_PER_DOCUMENT = 0.01; // ms
const NUM_TASKS = 1000;
const COMPLETED_TASKS = 400;

// Mocking the Task model
const MockTask = {
    countDocuments: async (query: any) => {
        // Simulate network latency for one round trip
        await new Promise(resolve => setTimeout(resolve, NETWORK_LATENCY));
        // Simulate DB execution time
        await new Promise(resolve => setTimeout(resolve, 5));
        if (query.isCompleted) return COMPLETED_TASKS;
        return NUM_TASKS;
    },
    aggregate: async (pipeline: any[]) => {
        // Simulate network latency for one round trip
        await new Promise(resolve => setTimeout(resolve, NETWORK_LATENCY));
        // Simulate DB execution time (aggregation might take slightly longer than a simple count)
        await new Promise(resolve => setTimeout(resolve, 7));
        return [{ totalTasks: NUM_TASKS, completedTasks: COMPLETED_TASKS }];
    }
};

async function runBaseline() {
    const start = performance.now();

    // Original code pattern
    const [totalTasks, completedTasks] = await Promise.all([
        MockTask.countDocuments({ userId: 'user123' }),
        MockTask.countDocuments({ userId: 'user123', isCompleted: true })
    ]);

    const end = performance.now();
    return {
        time: end - start,
        result: { totalTasks, completedTasks }
    };
}

async function runOptimized() {
    const start = performance.now();

    // Optimized code pattern
    const stats = await MockTask.aggregate([
        { $match: { userId: 'user123' } },
        {
            $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
                }
            }
        }
    ]);

    const totalTasks = stats[0]?.totalTasks || 0;
    const completedTasks = stats[0]?.completedTasks || 0;

    const end = performance.now();
    return {
        time: end - start,
        result: { totalTasks, completedTasks }
    };
}

async function main() {
    console.log('--- Performance Benchmark (Simulated) ---');
    console.log(`Simulated Network Latency: ${NETWORK_LATENCY}ms`);

    // Warmup
    await runBaseline();
    await runOptimized();

    let totalBaselineTime = 0;
    let totalOptimizedTime = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
        const b = await runBaseline();
        const o = await runOptimized();
        totalBaselineTime += b.time;
        totalOptimizedTime += o.time;
    }

    const avgBaseline = totalBaselineTime / iterations;
    const avgOptimized = totalOptimizedTime / iterations;

    console.log(`Baseline (2 queries): ${avgBaseline.toFixed(2)}ms`);
    console.log(`Optimized (1 query):   ${avgOptimized.toFixed(2)}ms`);
    console.log(`Improvement: ${(((avgBaseline - avgOptimized) / avgBaseline) * 100).toFixed(2)}%`);
}

main().catch(console.error);
