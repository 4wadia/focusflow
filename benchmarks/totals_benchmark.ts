import { performance } from 'perf_hooks';

// Mock data
const columns = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i),
  title: `Col ${i}`,
  tasks: Array.from({ length: 1000 }).map((_, j) => ({
    id: `t${i}-${j}`,
    isCompleted: Math.random() > 0.5
  }))
}));

// Baseline
function calculateBaseline(columns: any[]) {
  const totalPending = columns.reduce((acc, col) => acc + col.tasks.filter((t: any) => !t.isCompleted).length, 0);
  const totalCompleted = columns.reduce((acc, col) => acc + col.tasks.filter((t: any) => t.isCompleted).length, 0);
  return { totalPending, totalCompleted };
}

// Optimized
function calculateOptimized(columns: any[]) {
  let pending = 0;
  let completed = 0;
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.isCompleted) completed++;
      else pending++;
    }
  }
  return { totalPending: pending, totalCompleted: completed };
}

const ITERATIONS = 1000;

console.log('Warming up...');
for (let i = 0; i < 100; i++) {
  calculateBaseline(columns);
  calculateOptimized(columns);
}

console.log('Benchmarking Baseline...');
const startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  calculateBaseline(columns);
}
const endBaseline = performance.now();
const baselineTime = endBaseline - startBaseline;

console.log('Benchmarking Optimized...');
const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  calculateOptimized(columns);
}
const endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;

console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${(baselineTime / optimizedTime).toFixed(2)}x faster`);
