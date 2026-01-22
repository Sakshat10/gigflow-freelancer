// Task service - Backend API based
// Connects to the PostgreSQL database via the backend API

import { Thing } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchTasks = async (workspaceId?: string): Promise<Thing[]> => {
    if (!workspaceId) return [];

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/todos`, {
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to fetch tasks:', response.status);
            return [];
        }

        const data = await response.json();
        const todos = data.todos || [];

        // Map backend todos to frontend Thing type
        return todos.map((todo: any) => ({
            id: todo.id,
            title: todo.title,
            completed: todo.status === 'done',
            status: todo.status,
            createdAt: todo.createdAt,
            dueDate: todo.createdAt, // Use createdAt as fallback
            priority: 'medium',
            category: 'General',
            notes: '',
            workspaceId: workspaceId,
        }));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
};

export const createTask = async (data: Partial<Thing>): Promise<Thing> => {
    if (!data.workspaceId) {
        throw new Error('Workspace ID is required');
    }

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${data.workspaceId}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                title: data.title || 'New Task',
                status: data.status || 'todo',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create task');
        }

        const result = await response.json();
        const todo = result.todo;

        // Map backend todo to frontend Thing type
        return {
            id: todo.id,
            title: todo.title,
            completed: todo.status === 'done',
            status: todo.status,
            createdAt: todo.createdAt,
            dueDate: data.dueDate || new Date().toISOString(),
            priority: data.priority || 'medium',
            category: data.category || 'General',
            notes: data.notes || '',
            workspaceId: data.workspaceId,
        };
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

export const updateTask = async (taskId: string, data: Partial<Thing>): Promise<Thing | null> => {
    try {
        // Need to find the workspaceId - for now we'll use a PATCH endpoint if it exists
        // or we can get it from the data
        const workspaceId = data.workspaceId;

        if (!workspaceId) {
            console.error('Workspace ID required for update');
            return null;
        }

        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/todos/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                title: data.title,
                status: data.status,
            }),
        });

        if (!response.ok) {
            console.error('Failed to update task:', response.status);
            return null;
        }

        const result = await response.json();
        const todo = result.todo;

        return {
            id: todo.id,
            title: todo.title,
            completed: todo.status === 'done',
            status: todo.status,
            createdAt: todo.createdAt,
            dueDate: data.dueDate || todo.createdAt,
            priority: data.priority || 'medium',
            category: data.category || 'General',
            notes: data.notes || '',
            workspaceId: workspaceId,
        };
    } catch (error) {
        console.error('Error updating task:', error);
        return null;
    }
};

export const deleteTask = async (taskId: string, workspaceId?: string): Promise<boolean> => {
    if (!workspaceId) {
        console.error('Workspace ID required for delete');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/todos/${taskId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to delete task:', response.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        return false;
    }
};
