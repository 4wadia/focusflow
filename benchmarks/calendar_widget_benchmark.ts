import { performance } from "perf_hooks";

function benchmark() {
  const iterations = 100000;
  const daysInMonth = 31;
  const year = 2024;
  const month = 4;
  const startDay = 3;

  const startBaseline = performance.now();
  for (let i = 0; i < iterations; i++) {
    for (let day = 1; day <= daysInMonth; day++) {
      // isToday
      const today = new Date();
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      // isSunday
      const dateObj = new Date(year, month, day);
      const isSunday = dateObj.getDay() === 0;

      if (isToday || isSunday) { /* no-op to avoid unused var warning */ }
    }
  }
  const endBaseline = performance.now();

  const startOptimized = performance.now();
  for (let i = 0; i < iterations; i++) {
    const todayObj = new Date();
    const todayDate = todayObj.getDate();
    const todayMonth = todayObj.getMonth();
    const todayYear = todayObj.getFullYear();
    const isThisMonth = month === todayMonth && year === todayYear;

    for (let day = 1; day <= daysInMonth; day++) {
      // isToday
      const isToday = isThisMonth && day === todayDate;

      // isSunday
      const isSunday = (startDay + day - 1) % 7 === 0;

      if (isToday || isSunday) { /* no-op to avoid unused var warning */ }
    }
  }
  const endOptimized = performance.now();

  console.log(`Baseline (current code): ${(endBaseline - startBaseline).toFixed(2)}ms`);
  console.log(`Optimized (proposed): ${(endOptimized - startOptimized).toFixed(2)}ms`);
}

benchmark();
