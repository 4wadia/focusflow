export type Priority = 'High' | 'Medium' | 'Low' | 'Completed';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  duration?: string; // e.g. "30m", "1h"
  dueTime?: string; // e.g. "2:30 PM"
  date: string; // YYYY-MM-DD
  priority: Priority;
  colorClass: string; // Tailwind class for the dot color
  isCompleted?: boolean;
  subtasks?: Subtask[];
  tags?: string[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  preferences?: {
    darkMode: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

export type View = 'dashboard' | 'profile' | 'signup' | 'login';

export type ModalType = 'ADD_TASK' | 'ADD_COLUMN' | 'EDIT_TASK' | null;

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  columnId?: string; // For adding a task to a specific column
  taskId?: string; // For editing a specific task
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // Relative time string for now, e.g. "2m ago"
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Global declaration for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}