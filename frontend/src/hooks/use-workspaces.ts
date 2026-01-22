// Stub workspaces hook - for standalone frontend
// TODO: Implement with real backend

import { useState, useEffect } from 'react';
import { Workspace } from '@/types';

export const useWorkspaces = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(false);

    const refetchWorkspaces = async () => {
        console.log('refetchWorkspaces stub called');
        // Return empty for now
    };

    useEffect(() => {
        // Stub - no actual fetching
        setLoading(false);
    }, []);

    return {
        workspaces,
        loading,
        refetchWorkspaces,
    };
};
