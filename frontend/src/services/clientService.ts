// Stub client service - for standalone frontend
// TODO: Implement with real backend

export interface Client {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'previous' | 'potential';
    created_at?: string;
}

export const fetchClients = async (): Promise<Client[]> => {
    console.log('fetchClients stub called');
    return [];
};

export const addClient = async (
    name: string,
    email: string,
    status: 'active' | 'previous' | 'potential'
): Promise<Client> => {
    console.log('addClient stub called');
    return {
        id: 'stub-client-' + Date.now(),
        name,
        email,
        status,
        created_at: new Date().toISOString(),
    };
};

export const updateClientStatus = async (
    clientId: string,
    status: 'active' | 'previous' | 'potential'
): Promise<Client> => {
    console.log('updateClientStatus stub called');
    return {
        id: clientId,
        name: '',
        email: '',
        status,
    };
};

export const deleteClient = async (clientId: string): Promise<boolean> => {
    console.log('deleteClient stub called');
    return true;
};
