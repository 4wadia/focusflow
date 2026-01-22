import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { KanbanColumn } from './components/KanbanColumn';
import { RightSidebar } from './components/RightSidebar';
import { Modal } from './components/Modal';
import { ProfileView } from './components/ProfileView';
import { SignupView } from './components/SignupView';
import { LoginView } from './components/LoginView';
import { Toast, ToastType } from './components/Toast';
import { Column, Task, ModalState, Priority, User, View } from './types';
import { tasksApi, columnsApi, setToken, isAuthenticated, authApi } from './api';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = formatDate(new Date());

// Time Parsing Helpers
const parseTimeMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  // Format "HH:MM AM/PM"
  const [time, period] = timeStr.split(' ');
  if (!time || !period) return 0;

  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const parseDurationMinutes = (durStr?: string): number => {
  if (!durStr) return 0;
  // Format "1h 30m" or "30m" or "1h"
  let total = 0;
  const h = durStr.match(/(\d+)h/);
  const m = durStr.match(/(\d+)m/);
  if (h) total += parseInt(h[1]) * 60;
  if (m) total += parseInt(m[1]);
  return total;
}

const initialUser: User = {
  name: "Alex Morgan",
  email: "alex.morgan@focusflow.app",
  role: "Senior Product Designer",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB92NyINLm2wUAaFFkXQShuPVcFGfB0vY12T4lXJyZZ-i4-EO09393Fz_rvnGdbam755eQrvreGHLODR0DmkP5SvhtaUbFdLRsMCpwax8FDsK0bk-bGbPW8xq80u3BureB13glFD1l7ocH3upENwDoelC9pSv3aR2gIxO1uMS2_V_UPzd2juJ_gBBN2dXpGpohDc2C8s0OAVaJT0udwIbCSyv_EoniY2SpJl7WQJD23vq2VSkpeLhHL4Euk-AuSP0W-j_xMxDvzsw"
};

const initialColumns: Column[] = [
  {
    id: '1',
    title: 'All Tasks',
    tasks: [
      {
        id: 't1',
        title: 'Review Q3 Design Mocks',
        duration: '30m',
        dueTime: '2:00 PM',
        date: todayStr,
        priority: 'High',
        colorClass: 'bg-red-500',
        isCompleted: false
      },
      {
        id: 't2',
        title: 'Team Sync Meeting',
        duration: '1h',
        dueTime: '10:00 AM',
        date: todayStr,
        priority: 'Medium',
        colorClass: 'bg-amber-400',
        isCompleted: false
      }
    ]
  },
  {
    id: '2',
    title: 'Work',
    tasks: [
      {
        id: 't3',
        title: 'Send Invoice #2024',
        duration: '15m',
        dueTime: '5:30 PM',
        date: todayStr,
        priority: 'Low',
        colorClass: 'bg-blue-400',
        isCompleted: false
      }
    ]
  },
  {
    id: '3',
    title: 'Personal',
    tasks: [
      {
        id: 't4',
        title: 'Call Gym about Membership',
        priority: 'Completed',
        date: todayStr,
        colorClass: 'bg-neutral-200 dark:bg-neutral-700',
        isCompleted: true
      }
    ]
  }
];

export default function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  // View State Management
  const [currentView, setCurrentView] = useState<View>('signup');
  const [previousView, setPreviousView] = useState<View | null>(null);

  const [activeTab, setActiveTab] = useState('All Tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Notification State
  const [notifications, setNotifications] = useState<import('./types').Notification[]>([
    { id: '1', title: 'Welcome to FocusFlow', message: 'Get started by creating your first task!', time: 'Just now', read: false, type: 'info' }
  ]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newNotification: import('./types').Notification = {
      id: Date.now().toString(),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // --- Auth & Data Loading ---

  // Check for token in URL (after OAuth redirect) and load user data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // If token in URL, set it first
    if (token) {
      setToken(token);
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check if authenticated and load user/data
    const loadUserData = async () => {
      if (isAuthenticated()) {
        try {
          const { user: apiUser } = await authApi.getMe();
          setUser({
            name: apiUser.name,
            email: apiUser.email,
            role: apiUser.role || 'User',
            avatarUrl: apiUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.name)}&background=random`,
            preferences: apiUser.preferences,
          });

          // Load columns with tasks
          const selectedDateStr = formatDate(selectedDate);
          const { columns: apiColumns } = await columnsApi.getAll({ includeTasks: true, date: selectedDateStr });

          if (apiColumns && apiColumns.length > 0) {
            setColumns(apiColumns.map((col: any) => ({
              id: col._id,
              title: col.title,
              tasks: (col.tasks || []).map((task: any) => ({
                id: task._id,
                title: task.title,
                duration: task.duration,
                dueTime: task.dueTime,
                date: task.date,
                priority: task.priority,
                colorClass: task.priority === 'High' ? 'bg-red-500' :
                  task.priority === 'Medium' ? 'bg-amber-400' :
                    task.priority === 'Low' ? 'bg-blue-400' : 'bg-neutral-400',
                isCompleted: task.isCompleted,
              })),
            })));
          }

          setCurrentView('dashboard');
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // --- Helpers ---

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-amber-400';
      case 'Low': return 'bg-blue-400';
      default: return 'bg-neutral-400';
    }
  };


  const changeView = (newView: View) => {
    setPreviousView(currentView);
    setCurrentView(newView);
  };

  // --- Handlers ---

  const handleSignup = (name: string, email: string, avatarUrl?: string) => {
    setUser({
      ...user,
      name: name,
      email: email,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });
    changeView('dashboard');
    showToast("Account created successfully!", "success");
  };

  const handleLogin = (email: string, name?: string, avatarUrl?: string) => {
    // Default fallback values if login is just email
    const defaultName = "Alex Morgan";
    const defaultAvatar = initialUser.avatarUrl;

    setUser({
      ...user,
      name: name || defaultName,
      email: email,
      avatarUrl: avatarUrl || (email === initialUser.email ? defaultAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || defaultName)}&background=random`)
    });
    changeView('dashboard');

    // Simulate Security Alert Email
    setTimeout(() => {
      showToast(`Security Alert: Login detected from this device. Email sent to ${email}`, "info");
    }, 1500);
  };

  const handleLogout = () => {
    // 1. Call API to invalidate session on server (optional)
    authApi.logout().catch(err => console.error("Logout failed", err));

    // 2. Clear local user state
    setUser(initialUser);

    // 3. Navigate to Login
    changeView('login');

    showToast("Logged out successfully", "success");
  };

  const handleOpenAddTask = (columnId: string) => {
    setModal({ isOpen: true, type: 'ADD_TASK', columnId });
    setModalError(null);
  };

  const handleOpenEditTask = (columnId: string, taskId: string) => {
    setModal({ isOpen: true, type: 'EDIT_TASK', columnId, taskId });
    setModalError(null);
  };

  const handleOpenAddColumn = () => {
    setModal({ isOpen: true, type: 'ADD_COLUMN' });
    setModalError(null);
  };

  const handleCloseModal = () => {
    setModal({ ...modal, isOpen: false });
    setModalError(null);
  };

  const handleModalSubmit = async (data: { title: string; duration?: string; dueTime?: string; priority?: Priority }) => {
    // --- Validation Logic for High Priority ---
    if (data.priority === 'High' && (modal.type === 'ADD_TASK' || modal.type === 'EDIT_TASK')) {
      const targetDate = formatDate(selectedDate);
      // Get all tasks for the selected day
      const dayTasks = columns.flatMap(c => c.tasks).filter(t => t.date === targetDate);

      // Filter out the task being edited (if any) so it doesn't conflict with itself
      const otherHighTasks = dayTasks.filter(t => t.priority === 'High' && (!modal.taskId || t.id !== modal.taskId));

      // 1. Limit Check
      if (otherHighTasks.length >= 5) {
        setModalError("Daily Limit Reached: You can only have 5 high priority tasks per day.");
        return;
      }

      // 2. Time Conflict Check
      const newStart = parseTimeMinutes(data.dueTime);
      const newDuration = parseDurationMinutes(data.duration);
      const newEnd = newStart + newDuration;

      const hasConflict = otherHighTasks.some(t => {
        const tStart = parseTimeMinutes(t.dueTime);
        const tDuration = parseDurationMinutes(t.duration);
        const tEnd = tStart + tDuration;

        // Overlap formula: StartA < EndB && EndA > StartB
        return newStart < tEnd && newEnd > tStart;
      });

      if (hasConflict) {
        setModalError("Time Conflict: Another High priority task is scheduled during this time.");
        return;
      }
    }

    // --- Proceed if valid ---
    setModalError(null);

    if (modal.type === 'ADD_TASK' && modal.columnId) {
      try {
        // Call API to create task
        const apiPriority = (data.priority === 'Completed' ? 'Medium' : data.priority) || 'Medium';
        const { task: createdTask } = await tasksApi.create({
          columnId: modal.columnId,
          title: data.title,
          duration: data.duration,
          dueTime: data.dueTime,
          date: formatDate(selectedDate),
          priority: apiPriority as 'High' | 'Medium' | 'Low',
        });

        const newTask: Task = {
          id: createdTask._id,
          title: createdTask.title,
          duration: createdTask.duration,
          dueTime: createdTask.dueTime,
          date: createdTask.date,
          priority: createdTask.priority,
          colorClass: getPriorityColor(createdTask.priority),
          isCompleted: createdTask.isCompleted || false
        };

        setColumns(cols => cols.map(col => {
          if (col.id === modal.columnId) {
            return { ...col, tasks: [...col.tasks, newTask] };
          }
          return col;
        }));
        addNotification('New Task Created', `"${newTask.title}" added to board`, 'info');
        showToast('Task created!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to create task', 'error');
      }
    } else if (modal.type === 'EDIT_TASK' && modal.columnId && modal.taskId) {
      try {
        // Call API to update task
        const apiPriority = data.priority === 'Completed' ? undefined : data.priority;
        const { task: updatedTask } = await tasksApi.update(modal.taskId, {
          title: data.title,
          duration: data.duration,
          dueTime: data.dueTime,
          priority: apiPriority as 'High' | 'Medium' | 'Low' | undefined,
        });

        setColumns(cols => cols.map(col => {
          if (col.id === modal.columnId) {
            return {
              ...col,
              tasks: col.tasks.map(t => {
                if (t.id === modal.taskId) {
                  return {
                    ...t,
                    title: updatedTask.title,
                    duration: updatedTask.duration,
                    dueTime: updatedTask.dueTime,
                    priority: updatedTask.priority,
                    colorClass: getPriorityColor(updatedTask.priority)
                  };
                }
                return t;
              })
            };
          }
          return col;
        }));
        showToast('Task updated!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to update task', 'error');
      }
    } else if (modal.type === 'ADD_COLUMN') {
      try {
        // Call API to create column
        const { column: createdColumn } = await columnsApi.create(data.title);

        const newColumn: Column = {
          id: createdColumn._id,
          title: createdColumn.title,
          tasks: []
        };
        setColumns(cols => [...cols, newColumn]);
        showToast('Category created!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to create category', 'error');
      }
    }
    handleCloseModal();
  };

  const handleDeleteTask = async (columnId: string, taskId: string) => {
    try {
      // Call API to delete task
      await tasksApi.delete(taskId);

      // Update local state
      setColumns(cols => cols.map(col => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        return col;
      }));
      showToast('Task deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleTask = async (columnId: string, taskId: string) => {
    try {
      // Find the task locally to get its current state before toggling
      let currentTask: Task | undefined;
      columns.forEach(col => {
        if (col.id === columnId) {
          currentTask = col.tasks.find(t => t.id === taskId);
        }
      });

      if (!currentTask) {
        throw new Error("Task not found for toggling.");
      }

      const newCompletedStatus = !currentTask.isCompleted;

      // Call API to toggle task
      const { task: updatedTask } = await tasksApi.toggle(taskId);

      // Add notification for completion
      if (newCompletedStatus) {
        addNotification('Task Completed', `"${currentTask.title}" has been completed`, 'success');
      }

      // Update local state
      setColumns(cols => cols.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: col.tasks.map(t => {
              if (t.id === taskId) {
                return {
                  ...t,
                  isCompleted: updatedTask.isCompleted,
                  priority: updatedTask.priority,
                  colorClass: updatedTask.isCompleted ? 'bg-neutral-200 dark:bg-neutral-700' : getPriorityColor(updatedTask.priority)
                };
              }
              return t;
            })
          };
        }
        return col;
      }));
      showToast(updatedTask.isCompleted ? 'Task completed!' : 'Task reopened', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to toggle task', 'error');
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setColumns(cols => cols.filter(c => c.id !== columnId));
    }
  };

  // --- Filtering Logic ---

  const selectedDateStr = formatDate(selectedDate);

  // Get all dates that have tasks for the calendar indicators
  const taskDates = useMemo(() => {
    const dates = new Set<string>();
    columns.forEach(col => {
      col.tasks.forEach(task => {
        if (task.date && !task.isCompleted) {
          dates.add(task.date);
        }
      });
    });
    return dates;
  }, [columns]);

  const filteredColumns = useMemo(() => {
    let cols = columns;

    // Filter by Tab (Category Name approximation)
    if (activeTab !== 'All Tasks') {
      cols = cols.filter(c => c.title === activeTab);
    }

    // Filter by Date
    cols = cols.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.date === selectedDateStr)
    }));

    // Filter by Search Query (Task Title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cols = cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.title.toLowerCase().includes(query))
      }));
    }

    // Filter by Status
    if (filterStatus === 'Pending') {
      cols = cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => !t.isCompleted)
      }));
    } else if (filterStatus === 'Completed') {
      cols = cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.isCompleted)
      }));
    }

    // Filter by Priority
    if (filterPriority !== 'All') {
      cols = cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.priority === filterPriority)
      }));
    }

    return cols;
  }, [columns, activeTab, searchQuery, selectedDateStr, filterStatus, filterPriority]);

  const totalPending = columns.reduce((acc, col) => acc + col.tasks.filter(t => !t.isCompleted).length, 0);
  const totalCompleted = columns.reduce((acc, col) => acc + col.tasks.filter(t => t.isCompleted).length, 0);

  // Get current editing task if applicable
  const editingTask = useMemo(() => {
    if (modal.type === 'EDIT_TASK' && modal.columnId && modal.taskId) {
      const col = columns.find(c => c.id === modal.columnId);
      return col?.tasks.find(t => t.id === modal.taskId);
    }
    return undefined;
  }, [columns, modal]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-600 dark:border-t-neutral-100 rounded-full animate-spin"></div>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</span>
        </div>
      </div>
    );
  }

  // If in Signup view, render it immediately
  if (currentView === 'signup') {
    return (
      <SignupView
        onSignup={handleSignup}
        onNavigateToLogin={() => changeView('login')}
      />
    );
  }

  // If in Login view
  if (currentView === 'login') {
    return (
      <LoginView
        onLogin={handleLogin}
        onNavigateToSignup={() => changeView('signup')}
        showToast={showToast}
      />
    );
  }

  // Determine Dashboard Animation based on navigation
  let dashboardAnimation = 'animate-slide-in-up'; // Default entrance (e.g. from login)

  if (previousView === 'profile' && currentView === 'dashboard') {
    dashboardAnimation = 'animate-slide-in-left'; // Slide back from left when coming from profile
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-200">

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingCount={totalPending}
        onAddCategory={handleOpenAddColumn}
        onProfileClick={() => changeView('profile')}
        view={currentView}
        userAvatar={user.avatarUrl}
        userName={user.name}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterPriority={filterPriority}
        onFilterPriorityChange={setFilterPriority}
        notifications={notifications}
        onMarkAllRead={markAllNotificationsRead}
      />

      {currentView === 'dashboard' ? (
        <div className={`flex flex-grow overflow-hidden relative ${dashboardAnimation}`}>
          <main className="flex-grow flex gap-4 p-6 overflow-x-auto overflow-y-hidden">
            {filteredColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddClick={handleOpenAddTask}
                onTaskClick={handleOpenEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleTask={handleToggleTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </main>
          <RightSidebar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            taskDates={taskDates}
          />
        </div>
      ) : (
        <ProfileView
          user={user}
          onUpdateUser={setUser}
          onBack={() => changeView('dashboard')}
          onLogout={handleLogout}
          completedCount={totalCompleted}
          completedTasks={columns.flatMap(c => c.tasks).filter(t => t.isCompleted)}
        />
      )}

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        task={editingTask}
        errorMessage={modalError}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}