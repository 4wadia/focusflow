// Mock Task model
const TaskMock = {
    countDocuments: async (query: any) => {
        // Simulate DB roundtrip
        await new Promise(resolve => setTimeout(resolve, 10));
        return query.isCompleted ? 40 : 100;
    },
    aggregate: async (pipeline: any[]) => {
        // Simulate DB roundtrip
        await new Promise(resolve => setTimeout(resolve, 10)); // Single call, same latency
        return [{
            totalTasks: 100,
            completedTasks: 40
        }];
    }
};

async function runBenchmark() {
    console.log('🚀 Starting User Stats Benchmark (Mocked)...');

    const iterations = 50;
    const userId = "mock-user-id";

    // Baseline: Current countDocuments approach
    console.log(`⏱️  Running countDocuments baseline (${iterations} iterations)...`);
    const startBase = performance.now();
    for (let i = 0; i < iterations; i++) {
        await Promise.all([
            TaskMock.countDocuments({ userId }),
            TaskMock.countDocuments({ userId, isCompleted: true })
        ]);
    }
    const endBase = performance.now();
    const durationBase = endBase - startBase;

    console.log(`📊 Total time (Base): ${durationBase.toFixed(2)}ms`);
    console.log(`📊 Avg per call (Base): ${(durationBase / iterations).toFixed(2)}ms`);

    // Optimized: New aggregate approach
    console.log(`⏱️  Running aggregate optimization (${iterations} iterations)...`);
    const startOpt = performance.now();
    for (let i = 0; i < iterations; i++) {
        const [stats] = await TaskMock.aggregate([
            { $match: { userId } },
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
        const totalTasks = stats?.totalTasks || 0;
        const completedTasks = stats?.completedTasks || 0;
    }
    const endOpt = performance.now();
    const durationOpt = endOpt - startOpt;

    console.log(`📊 Total time (Opt): ${durationOpt.toFixed(2)}ms`);
    console.log(`📊 Avg per call (Opt): ${(durationOpt / iterations).toFixed(2)}ms`);

    const improvement = ((durationBase - durationOpt) / durationBase) * 100;
    console.log(`🚀 Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark();
