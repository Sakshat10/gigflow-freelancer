// Workspace service - localStorage based for standalone frontend

export {
    deleteWorkspace,
    createWorkspace,
    fetchWorkspaces,
    fetchWorkspace
} from './workspace.mutations';

export {
    mapWorkspaceDataToWorkspace,
    mapWorkspaceDataArrayToWorkspaceArray
} from './workspace.types';
