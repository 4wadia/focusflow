import { useState, useEffect, useCallback } from 'react';
import { columnsApi, tasksApi, userApi, authApi, setToken, removeToken, isAuthenticated } from './api';
import { Column, Task, User, Priority } from './types';

// Helper to convert API task to frontend task format
const mapApiTaskToTask = (apiTask: any): Task => ({
    id: apiTask._id,
    title: apiTask.title,
    duration: apiTask.duration,
    dueTime: apiTask.dueTime,
    date: apiTask.date,
    priority: apiTask.priority as Priority,
    colorClass: getPriorityColor(apiTask.priority),
    isCompleted: apiTask.isCompleted,
});

const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'High': return 'bg-red-500';
        case 'Medium': return 'bg-amber-400';
        case 'Low': return 'bg-blue-400';
        case 'Completed': return 'bg-neutral-200 dark:bg-neutral-700';
        default: return 'bg-neutral-400';
    }
};

// Helper to convert API column to frontend column format
const mapApiColumnToColumn = (apiColumn: any): Column => ({
    id: apiColumn._id,
    title: apiColumn.title,
    tasks: (apiColumn.tasks || []).map(mapApiTaskToTask),
});

// Custom hook for authentication
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check for token in URL (after OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            setToken(token);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    // Fetch current user
    const fetchUser = useCallback(async () => {
        if (!isAuthenticated()) {
            setIsLoading(false);
            setIsLoggedIn(false);
            return;
        }

        try {
            const { user: apiUser } = await authApi.getMe();
            setUser({
                name: apiUser.name,
                email: apiUser.email,
                role: apiUser.role || 'User',
                avatarUrl: apiUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.name)}&background=random`,
            });
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            removeToken();
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (e) {
            // Ignore errors
        }
        removeToken();
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    const updateUser = useCallback(async (data: Partial<User>) => {
        try {
            const { user: updatedUser } = await userApi.updateProfile(data);
            setUser(prev => prev ? { ...prev, ...data } : null);
            return updatedUser;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }, []);

    return {
        user,
        isLoading,
        isLoggedIn,
        logout,
        updateUser,
        refetchUser: fetchUser,
    };
}

// Custom hook for columns and tasks
export function useBoard(selectedDate: string) {
    const [columns, setColumns] = useState<Column[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch columns with tasks for the selected date
    const fetchBoard = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { columns: apiColumns } = await columnsApi.getAll({
                includeTasks: true,
                date: selectedDate,
            });

            setColumns(apiColumns.map(mapApiColumnToColumn));
        } catch (err: any) {
            console.error('Failed to fetch board:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchBoard();
        }
    }, [fetchBoard]);

    // Add task
    const addTask = useCallback(async (columnId: string, taskData: {
        title: string;
        duration?: string;
        dueTime?: string;
        priority?: 'High' | 'Medium' | 'Low';
    }) => {
        try {
            const { task: newTask } = await tasksApi.create({
                columnId,
                title: taskData.title,
                duration: taskData.duration,
                dueTime: taskData.dueTime,
                date: selectedDate,
                priority: taskData.priority,
            });

            setColumns(cols => cols.map(col => {
                if (col.id === columnId) {
                    return {
                        ...col,
                        tasks: [...col.tasks, mapApiTaskToTask(newTask)],
                    };
                }
                return col;
            }));

            return newTask;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create task');
        }
    }, [selectedDate]);

    // Update task
    const updateTask = useCallback(async (columnId: string, taskId: string, taskData: Partial<Task>) => {
        try {
            const { task: updatedTask } = await tasksApi.update(taskId, {
                ...taskData,
                priority: taskData.priority === 'Completed' ? undefined : taskData.priority as 'High' | 'Medium' | 'Low' | undefined,
            });

            setColumns(cols => cols.map(col => {
                if (col.id === columnId) {
                    return {
                        ...col,
                        tasks: col.tasks.map(t =>
                            t.id === taskId ? mapApiTaskToTask(updatedTask) : t
                        ),
                    };
                }
                return col;
            }));

            return updatedTask;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update task');
        }
    }, []);

    // Delete task
    const deleteTask = useCallback(async (columnId: string, taskId: string) => {
        try {
            await tasksApi.delete(taskId);

            setColumns(cols => cols.map(col => {
                if (col.id === columnId) {
                    return {
                        ...col,
                        tasks: col.tasks.filter(t => t.id !== taskId),
                    };
                }
                return col;
            }));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete task');
        }
    }, []);

    // Toggle task completion
    const toggleTask = useCallback(async (columnId: string, taskId: string) => {
        try {
            const { task: updatedTask } = await tasksApi.toggle(taskId);

            setColumns(cols => cols.map(col => {
                if (col.id === columnId) {
                    return {
                        ...col,
                        tasks: col.tasks.map(t =>
                            t.id === taskId ? mapApiTaskToTask(updatedTask) : t
                        ),
                    };
                }
                return col;
            }));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to toggle task');
        }
    }, []);

    // Add column
    const addColumn = useCallback(async (title: string) => {
        try {
            const { column: newColumn } = await columnsApi.create(title);

            setColumns(cols => [...cols, {
                id: newColumn._id,
                title: newColumn.title,
                tasks: [],
            }]);

            return newColumn;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create column');
        }
    }, []);

    // Delete column
    const deleteColumn = useCallback(async (columnId: string) => {
        try {
            await columnsApi.delete(columnId);
            setColumns(cols => cols.filter(c => c.id !== columnId));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete column');
        }
    }, []);

    return {
        columns,
        isLoading,
        error,
        refetch: fetchBoard,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addColumn,
        deleteColumn,
    };
}

// Custom hook for user stats
export function useUserStats() {
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!isAuthenticated()) return;

        try {
            const { stats: apiStats } = await userApi.getStats();
            setStats(apiStats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
}
