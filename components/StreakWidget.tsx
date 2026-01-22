import React from 'react';

export const StreakWidget: React.FC = () => {
  return (
    <div>
      <h3 className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-4">Daily Streak</h3>
      <div className="bg-background-light dark:bg-background-dark/50 p-4 rounded-2xl relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">5</span>
              <span className="text-sm font-medium text-text-secondary-light">Days</span>
            </div>
            <p className="text-[10px] font-bold text-orange-500 mt-1">Keep it up 🔥</p>
          </div>
          <div className="size-12">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <path className="text-border-light dark:text-border-dark" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
              <path className="text-orange-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="70, 100" strokeLinecap="round" strokeWidth="4"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};