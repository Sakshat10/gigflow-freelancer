// Workspace mutations - Backend API based
// Connects to the PostgreSQL database via the backend API

import { Workspace } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const deleteWorkspace = async (workspaceId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to delete workspace');
        }

        console.log('Workspace deleted:', workspaceId);
        return true;
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return false;
    }
};

export const createWorkspace = async (data: {
    name: string;
    description?: string;
    color: string;
    clientEmail?: string;
}): Promise<Workspace> => {
    try {
        const response = await fetch(`${API_URL}/api/workspaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                name: data.name,
                description: data.description,
                clientEmail: data.clientEmail,
                color: data.color,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create workspace');
        }

        const result = await response.json();
        const dbWorkspace = result.workspace;

        // Map database workspace to frontend Workspace type
        const workspace: Workspace = {
            id: dbWorkspace.id,
            name: dbWorkspace.name,
            description: dbWorkspace.description || undefined,
            color: dbWorkspace.color || data.color,
            fileCount: 0,
            messageCount: 0,
            lastActivity: 'Just now',
            hasNewMessages: false,
            clientEmail: dbWorkspace.clientEmail || undefined,
            clientName: dbWorkspace.name,
        };

        console.log('Workspace created:', workspace);
        return workspace;
    } catch (error) {
        console.error('Error creating workspace:', error);
        throw error;
    }
};

export const fetchWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const response = await fetch(`${API_URL}/api/workspaces`, {
            credentials: 'include',
        });

        if (!response.ok) {
            // If unauthorized or error, return empty array
            console.error('Failed to fetch workspaces:', response.status);
            return [];
        }

        const result = await response.json();
        const dbWorkspaces = result.workspaces || [];

        // Map database workspaces to frontend Workspace type
        return dbWorkspaces.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            description: ws.description || undefined,
            color: ws.color || 'blue',
            fileCount: ws._count?.files || 0,
            messageCount: ws._count?.messages || 0,
            lastActivity: formatLastActivity(ws.updatedAt),
            hasNewMessages: false,
            clientEmail: ws.clientEmail || undefined,
            clientName: ws.name,
        }));
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return [];
    }
};

export const fetchWorkspace = async (id: string): Promise<Workspace | null> => {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${id}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        const ws = result.workspace;

        if (!ws) return null;

        return {
            id: ws.id,
            name: ws.name,
            description: ws.description || undefined,
            color: ws.color || 'blue',
            fileCount: ws._count?.files || 0,
            messageCount: ws._count?.messages || 0,
            lastActivity: formatLastActivity(ws.updatedAt),
            hasNewMessages: false,
            clientEmail: ws.clientEmail || undefined,
            clientName: ws.name,
        };
    } catch (error) {
        console.error('Error fetching workspace:', error);
        return null;
    }
};

// Helper function to format last activity time
function formatLastActivity(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}
