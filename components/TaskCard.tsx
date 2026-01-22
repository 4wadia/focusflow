import React from 'react';
import { Task } from '../types';
import { Icon } from './Icon';

interface TaskCardProps {
  task: Task;
  onClick: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onToggleComplete, onDelete }) => {
  const isCompleted = task.isCompleted;
  
  // Base classes
  let containerClasses = "bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-soft border border-transparent hover:border-primary/30 cursor-pointer group transition-all select-none relative overflow-hidden";
  
  if (isCompleted) {
    containerClasses += " opacity-60 grayscale-[0.5]";
  }

  return (
    <div className={containerClasses} onClick={() => onClick(task.id)}>
      <div className="flex justify-between items-start mb-2">
        <button
          onClick={(e) => {
             e.stopPropagation();
             onToggleComplete(task.id);
          }}
          className={`shrink-0 size-5 rounded-full border flex items-center justify-center transition-all z-10 ${
            isCompleted 
              ? 'bg-green-500 border-green-500' 
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary'
          }`}
        >
          {isCompleted ? (
            <Icon name="check" size={14} className="text-white font-bold" />
          ) : (
            <div className={`size-2 rounded-full ${task.colorClass}`} />
          )}
        </button>

        <div className="flex gap-2 items-center">
            {task.dueTime && !isCompleted && (
                <span className="text-[10px] font-mono font-medium text-text-secondary-light flex items-center gap-1">
                    <Icon name="schedule" size={12} />
                    {task.dueTime}
                </span>
            )}
            {isCompleted ? (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-[10px] font-mono font-bold text-green-700 dark:text-green-400 uppercase">Done</span>
            ) : (
            <span className="text-[10px] font-mono font-medium text-text-secondary-light">{task.duration || '--'}</span>
            )}
        </div>
      </div>
      <p className={`text-sm font-semibold mb-3 ${isCompleted ? 'line-through text-text-secondary-light' : ''}`}>{task.title}</p>
      <div className="flex items-center justify-between text-[10px] text-text-secondary-light font-bold">
        <span className="uppercase tracking-tighter">{isCompleted ? 'Completed' : `${task.priority} Priority`}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
    </div>
  );
};