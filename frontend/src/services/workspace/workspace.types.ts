// Stub workspace types - for standalone frontend
import { Workspace } from '@/types';

export interface WorkspaceData {
    id: string;
    name: string;
    description?: string;
    color: string;
    hasNewMessages?: boolean;
    messageCount?: number;
    lastActivity?: string;
    created_at?: string;
}

export const mapWorkspaceDataToWorkspace = (data: WorkspaceData): Workspace => ({
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    hasNewMessages: data.hasNewMessages || false,
    messageCount: data.messageCount || 0,
    lastActivity: data.lastActivity || 'Never',
});

export const mapWorkspaceDataArrayToWorkspaceArray = (data: WorkspaceData[]): Workspace[] => {
    return data.map(mapWorkspaceDataToWorkspace);
};
