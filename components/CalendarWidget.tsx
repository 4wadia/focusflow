import React, { useState } from 'react';
import { Icon } from './Icon';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  taskDates: Set<string>; // Set of date strings "YYYY-MM-DD" that have tasks
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ selectedDate, onDateSelect, taskDates }) => {
  // We keep month view state local as it doesn't affect the global selected date directly until clicked
  const [viewDate, setViewDate] = useState(selectedDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Changed to start with Sunday
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Helper to format date key
  const formatDateKey = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // Helper to get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  
  // Helper to get day of week of first day (0=Sun, 1=Mon, ..., 6=Sat)
  // Since our array starts at Sunday (index 0), we can use getDay() directly.
  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (d: number) => {
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const hasTask = (d: number) => {
    const key = formatDateKey(year, month, d);
    return taskDates.has(key);
  };

  // Generate grid array
  const grid = [];
  // Empty slots for previous month
  for (let i = 0; i < startDay; i++) {
    grid.push({ day: null, key: `empty-${i}` });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push({ day: i, key: `day-${i}` });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-text-main-light dark:text-text-main-dark uppercase tracking-wide">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary-light hover:text-primary transition-colors">
            <Icon name="chevron_left" size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-secondary-light hover:text-primary transition-colors">
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-xs font-bold text-text-secondary-light mb-2">
        {daysOfWeek.map((d, i) => (
            <div key={i} className={`text-center py-1 ${i === 0 ? 'text-red-500' : ''}`}>
                {d}
            </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center">
        {grid.map((cell, index) => {
          if (!cell.day) {
            return <div key={cell.key} className="aspect-square"></div>;
          }

          // Calculate column index to identify Sundays (index % 7 === 0)
          // We must account for the empty slots at the start to find the true column of the specific day
          // Actually, simply relying on the day of week logic:
          const dateObj = new Date(year, month, cell.day);
          const isSunday = dateObj.getDay() === 0;

          const hasActiveTask = hasTask(cell.day);
          const selected = isSelected(cell.day);
          const today = isToday(cell.day);

          let className = "aspect-square flex flex-col items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-all relative ";
          
          if (selected) {
            // Selected state overrides everything
            className += "bg-primary text-white shadow-lg shadow-primary/20 transform scale-105 font-bold";
          } else {
            // Base text color
            if (isSunday) {
                className += "text-red-500 ";
            } else {
                className += "text-text-main-light dark:text-text-main-dark ";
            }

            // Hover state
            className += "hover:bg-neutral-100 dark:hover:bg-neutral-800 ";

            // Today state
            if (today) {
                className += "bg-primary/5 border-2 border-primary/20 font-bold ";
            }

            // Task state (if not selected)
            if (hasActiveTask) {
                className += "bg-neutral-50 dark:bg-neutral-800/50 ";
            }
          }

          return (
            <div 
              key={cell.key} 
              className={className}
              onClick={() => onDateSelect(new Date(year, month, cell.day))}
            >
              <span>{cell.day}</span>
              
              {/* Task Indicator Dot */}
              {hasActiveTask && (
                <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full ${selected ? 'bg-white' : 'bg-primary'}`}></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};