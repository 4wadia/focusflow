import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Column } from '../types';
import { TaskCard } from './TaskCard';
import { Icon } from './Icon';

interface KanbanColumnProps {
  column: Column;
  onAddClick: (columnId: string) => void;
  onTaskClick: (columnId: string, taskId: string) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onToggleTask: (columnId: string, taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onAddClick,
  onTaskClick,
  onDeleteTask,
  onToggleTask,
  onDeleteColumn
}) => {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 animate-fade-in h-full">
      <div className="flex items-center justify-between px-2 group shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-text-secondary-light truncate">{column.title}</h3>
          <span className="bg-border-light dark:bg-border-dark px-2 py-0.5 rounded text-[10px] font-bold shrink-0">{column.tasks.length}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-text-secondary-light hover:text-red-500 p-1"
            title="Delete Column"
          >
            <Icon name="delete" size={16} />
          </button>
          <button
            onClick={() => onAddClick(column.id)}
            className="text-text-secondary-light hover:text-primary p-1"
          >
            <Icon name="add" size={18} />
          </button>
        </div>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar min-h-[100px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    className={snapshot.isDragging ? 'opacity-90 rotate-2' : ''}
                  >
                    <TaskCard
                      task={task}
                      onClick={(taskId) => onTaskClick(column.id, taskId)}
                      onDelete={(taskId) => onDeleteTask(column.id, taskId)}
                      onToggleComplete={(taskId) => onToggleTask(column.id, taskId)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};