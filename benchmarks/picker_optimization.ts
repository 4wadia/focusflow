
const COPIES = 21;
const items = Array.from({ length: 100 }, (_, i) => i); // 100 items

function originalMethod(items: (string | number)[]) {
  let res: (string | number)[] = [];
  for (let i = 0; i < COPIES; i++) {
    res = res.concat(items);
  }
  return res;
}

function optimizedMethod1(items: (string | number)[]) {
  return Array.from({ length: COPIES }, () => items).flat();
}

function optimizedMethod2(items: (string | number)[]) {
  return Array(COPIES).fill(items).flat();
}

function optimizedMethod3(items: (string | number)[]) {
  return Array.from({ length: COPIES }).flatMap(() => items);
}

function runBenchmark() {
  const iterations = 100000;

  console.log(`Running benchmark with ${iterations} iterations...`);

  // Warm up
  originalMethod(items);
  optimizedMethod1(items);
  optimizedMethod2(items);
  optimizedMethod3(items);

  const startOriginal = performance.now();
  for (let i = 0; i < iterations; i++) {
    originalMethod(items);
  }
  const endOriginal = performance.now();
  console.log(`Original Method: ${(endOriginal - startOriginal).toFixed(2)}ms`);

  const startOptimized1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    optimizedMethod1(items);
  }
  const endOptimized1 = performance.now();
  console.log(`Optimized Method 1 (Array.from.flat): ${(endOptimized1 - startOptimized1).toFixed(2)}ms`);

  const startOptimized2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    optimizedMethod2(items);
  }
  const endOptimized2 = performance.now();
  console.log(`Optimized Method 2 (Array.fill.flat): ${(endOptimized2 - startOptimized2).toFixed(2)}ms`);

  const startOptimized3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    optimizedMethod3(items);
  }
  const endOptimized3 = performance.now();
  console.log(`Optimized Method 3 (Array.from.flatMap): ${(endOptimized3 - startOptimized3).toFixed(2)}ms`);
}

runBenchmark();
