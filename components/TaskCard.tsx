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
          className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all z-10 ${isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <Icon name="check" size={16} className="text-white font-bold" />
          ) : (
            <div className={`size-2.5 rounded-full ${task.colorClass} group-hover:scale-110 transition-transform`} />
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
      <p className={`text-sm font-semibold mb-2 ${isCompleted ? 'line-through text-text-secondary-light' : ''}`}>{task.title}</p>

      {/* Tag Badges */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary text-[9px] font-bold rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-text-secondary-light text-[9px] font-bold rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] text-text-secondary-light font-bold">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-tighter">{isCompleted ? 'Completed' : `${task.priority} Priority`}</span>
          {/* Subtask Progress Indicator */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[9px]">
              <Icon name="checklist" size={10} />
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          )}
        </div>
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