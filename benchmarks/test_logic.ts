// Mocking the Task model and mongoose
const mockMongoose = {
    Types: {
        ObjectId: class {
            id: string;
            constructor(id: string) { this.id = id; }
        }
    }
};

const MockTask = {
    aggregate: async (pipeline: any[]) => {
        // Basic validation of the pipeline
        const match = pipeline.find(p => p.$match);
        const group = pipeline.find(p => p.$group);

        if (!match || !group) throw new Error('Invalid pipeline');
        if (!(match.$match.userId instanceof mockMongoose.Types.ObjectId)) {
            throw new Error('userId is not an ObjectId');
        }

        return [{ totalTasks: 10, completedTasks: 4 }];
    }
};

async function testLogic() {
    const user = { userId: '507f1f77bcf86cd799439011' };

    // Simulate the route logic
    const statsResult = await MockTask.aggregate([
        { $match: { userId: new mockMongoose.Types.ObjectId(user.userId) } },
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

    const totalTasks = statsResult[0]?.totalTasks || 0;
    const completedTasks = statsResult[0]?.completedTasks || 0;

    const stats = {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate: totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0
    };

    console.log('Logic Test Result:', stats);
    if (stats.totalTasks === 10 && stats.completedTasks === 4 && stats.pendingTasks === 6 && stats.completionRate === 40) {
        console.log('✅ Logic test passed!');
    } else {
        console.log('❌ Logic test failed!');
        process.exit(1);
    }
}

testLogic().catch(err => {
    console.error(err);
    process.exit(1);
});
