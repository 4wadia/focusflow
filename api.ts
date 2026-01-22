// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get stored auth token
const getToken = (): string | null => {
    return localStorage.getItem('focusflow_token');
};

// Set auth token
export const setToken = (token: string): void => {
    localStorage.setItem('focusflow_token', token);
};

// Remove auth token
export const removeToken = (): void => {
    localStorage.removeItem('focusflow_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ============ AUTH API ============

export const authApi = {
    // Get Google OAuth URL
    getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,

    // Get current user
    getMe: () => apiRequest<{ user: any }>('/auth/me'),

    // Logout
    logout: () => {
        removeToken();
        return apiRequest<{ message: string }>('/auth/logout', { method: 'POST' });
    },
};

// ============ TASKS API ============

export interface TaskData {
    columnId: string;
    title: string;
    duration?: string;
    dueTime?: string;
    date: string;
    priority?: 'High' | 'Medium' | 'Low';
    subtasks?: Array<{ id: string; text: string; completed: boolean }>;
    tags?: string[];
}

export const tasksApi = {
    // Get all tasks (optionally filter by date or column)
    getAll: (params?: { date?: string; columnId?: string }) => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return apiRequest<{ tasks: any[] }>(`/api/tasks${query ? `?${query}` : ''}`);
    },

    // Get single task
    get: (id: string) => apiRequest<{ task: any }>(`/api/tasks/${id}`),

    // Create task
    create: (data: TaskData) =>
        apiRequest<{ task: any }>('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update task
    update: (id: string, data: Partial<TaskData & { isCompleted?: boolean }>) =>
        apiRequest<{ task: any }>(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete task
    delete: (id: string) =>
        apiRequest<{ message: string }>(`/api/tasks/${id}`, { method: 'DELETE' }),

    // Toggle task completion
    toggle: (id: string) =>
        apiRequest<{ task: any }>(`/api/tasks/${id}/toggle`, { method: 'PATCH' }),

    // Move task to different column/position
    move: (id: string, data: { columnId: string; order: number }) =>
        apiRequest<{ task: any }>(`/api/tasks/${id}/move`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
};

// ============ COLUMNS API ============

export const columnsApi = {
    // Get all columns (optionally with tasks)
    getAll: (params?: { includeTasks?: boolean; date?: string }) => {
        const query = new URLSearchParams({
            ...(params?.includeTasks && { includeTasks: 'true' }),
            ...(params?.date && { date: params.date }),
        }).toString();
        return apiRequest<{ columns: any[] }>(`/api/columns${query ? `?${query}` : ''}`);
    },

    // Create column
    create: (title: string) =>
        apiRequest<{ column: any }>('/api/columns', {
            method: 'POST',
            body: JSON.stringify({ title }),
        }),

    // Update column
    update: (id: string, data: { title?: string; order?: number }) =>
        apiRequest<{ column: any }>(`/api/columns/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete column
    delete: (id: string) =>
        apiRequest<{ message: string }>(`/api/columns/${id}`, { method: 'DELETE' }),
};

// ============ USER API ============

export const userApi = {
    // Get profile
    getProfile: () => apiRequest<{ user: any }>('/api/users/profile'),

    // Update profile
    updateProfile: (data: { name?: string; role?: string; preferences?: any }) =>
        apiRequest<{ user: any }>('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Get stats
    getStats: () => apiRequest<{ stats: any }>('/api/users/stats'),
};
