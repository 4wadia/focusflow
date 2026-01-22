import React from 'react';
import { CalendarWidget } from './CalendarWidget';
import { Icon } from './Icon';

interface RightSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  taskDates: Set<string>;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ selectedDate, onDateSelect, taskDates }) => {
  return (
    <aside className="flex-none w-80 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark overflow-y-auto flex flex-col transition-all duration-300">
      <div className="p-6 flex flex-col gap-8">
        <CalendarWidget 
          selectedDate={selectedDate} 
          onDateSelect={onDateSelect} 
          taskDates={taskDates}
        />
      </div>
    </aside>
  );
};