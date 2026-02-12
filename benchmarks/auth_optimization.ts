
import { performance } from "perf_hooks";

// Mocking User object and its save method
class MockUser {
    name: string;
    avatarUrl: string;

    constructor(name: string, avatarUrl: string) {
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    async save() {
        // Simulate database I/O latency
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms simulated latency
    }
}

async function runBenchmark() {
    console.log("Starting Auth Save Optimization Benchmark...");

    const iterations = 50;
    const googleUserSame = {
        name: "Test User",
        picture: "https://example.com/avatar.png"
    };
    const googleUserDifferent = {
        name: "Updated User",
        picture: "https://example.com/new-avatar.png"
    };

    // Scenario 1: Always Save (Current)
    console.log("\nRunning Baseline (Always Save, Data same)...");
    const startBaseline = performance.now();
    for (let i = 0; i < iterations; i++) {
        const user = new MockUser("Test User", "https://example.com/avatar.png");
        user.name = googleUserSame.name;
        user.avatarUrl = googleUserSame.picture;
        await user.save();
    }
    const endBaseline = performance.now();
    const baselineTotal = endBaseline - startBaseline;
    const baselineAvg = baselineTotal / iterations;

    // Scenario 2: Optimized (Data same)
    console.log("Running Optimized (Conditional Save, Data same)...");
    const startOptimizedSame = performance.now();
    for (let i = 0; i < iterations; i++) {
        const user = new MockUser("Test User", "https://example.com/avatar.png");
        if (user.name !== googleUserSame.name || user.avatarUrl !== googleUserSame.picture) {
            user.name = googleUserSame.name;
            user.avatarUrl = googleUserSame.picture;
            await user.save();
        }
    }
    const endOptimizedSame = performance.now();
    const optimizedSameTotal = endOptimizedSame - startOptimizedSame;
    const optimizedSameAvg = optimizedSameTotal / iterations;

    // Scenario 3: Optimized (Data different)
    console.log("Running Optimized (Conditional Save, Data different)...");
    const startOptimizedDiff = performance.now();
    for (let i = 0; i < iterations; i++) {
        const user = new MockUser("Test User", "https://example.com/avatar.png");
        if (user.name !== googleUserDifferent.name || user.avatarUrl !== googleUserDifferent.picture) {
            user.name = googleUserDifferent.name;
            user.avatarUrl = googleUserDifferent.picture;
            await user.save();
        }
    }
    const endOptimizedDiff = performance.now();
    const optimizedDiffTotal = endOptimizedDiff - startOptimizedDiff;
    const optimizedDiffAvg = optimizedDiffTotal / iterations;

    console.log("\n--- Results ---");
    console.log(`Baseline Avg (Same Data): ${baselineAvg.toFixed(2)}ms`);
    console.log(`Optimized Avg (Same Data): ${optimizedSameAvg.toFixed(2)}ms`);
    console.log(`Optimized Avg (Diff Data): ${optimizedDiffAvg.toFixed(2)}ms`);
    console.log(`Improvement (Same Data): ${(((baselineAvg - optimizedSameAvg) / baselineAvg) * 100).toFixed(2)}%`);
    console.log(`Overhead (Diff Data): ${(((optimizedDiffAvg - baselineAvg) / baselineAvg) * 100).toFixed(2)}%`);
    console.log("---------------");
}

runBenchmark().catch(console.error);
