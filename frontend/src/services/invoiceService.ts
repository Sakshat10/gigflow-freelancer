// Invoice service - Backend API based
// Connects to the PostgreSQL database via the backend API

import { Invoice } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Extended invoice type with workspace info
export interface InvoiceWithWorkspace extends Invoice {
    workspaceName: string;
    clientEmail?: string;
}

// Fetch all invoices across all workspaces
export const fetchAllInvoices = async (): Promise<InvoiceWithWorkspace[]> => {
    try {
        const response = await fetch(`${API_URL}/api/invoices`, {
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to fetch all invoices:', response.status);
            return [];
        }

        const data = await response.json();
        const invoices = data.invoices || [];

        // Map backend invoices to frontend type
        return invoices.map((inv: any) => ({
            id: inv.id,
            clientName: inv.clientName || inv.workspaceName || 'Client',
            amount: inv.amount,
            status: inv.status === 'paid' ? 'Paid' : 'Pending' as const,
            date: inv.createdAt,
            dueDate: inv.dueDate,
            description: '',
            taxPercentage: inv.taxPercentage || 0,
            workspaceId: inv.workspaceId,
            createdAt: inv.createdAt,
            paypalEmail: null,
            workspaceName: inv.workspaceName,
            clientEmail: inv.clientEmail,
        }));
    } catch (error) {
        console.error('Error fetching all invoices:', error);
        return [];
    }
};

export const fetchInvoices = async (workspaceId?: string): Promise<Invoice[]> => {
    if (!workspaceId) return [];

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/invoices`, {
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to fetch invoices:', response.status);
            return [];
        }

        const data = await response.json();
        const invoices = data.invoices || [];
        const workspaceName = data.workspaceName || 'Client';

        // Map backend invoices to frontend Invoice type
        return invoices.map((inv: any) => ({
            id: inv.id,
            clientName: inv.clientName || workspaceName,
            amount: inv.amount,
            status: inv.status === 'paid' ? 'Paid' : 'Pending' as const,
            date: inv.createdAt,
            dueDate: inv.dueDate,
            description: '',
            taxPercentage: inv.taxPercentage || 0,
            workspaceId: workspaceId,
            createdAt: inv.createdAt,
            paypalEmail: null,
        }));
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
};

export const createInvoice = async (data: Partial<Invoice> & { currency?: string }): Promise<Invoice> => {
    if (!data.workspaceId) {
        throw new Error('Workspace ID is required');
    }

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${data.workspaceId}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                clientName: data.clientName || 'Client',
                amount: data.amount || 0,
                taxPercentage: data.taxPercentage || 0,
                dueDate: data.dueDate || new Date().toISOString(),
                status: data.status === 'Paid' ? 'paid' : 'draft',
                currency: data.currency || 'USD',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create invoice');
        }

        const result = await response.json();
        const inv = result.invoice;

        // Map backend invoice to frontend Invoice type
        return {
            id: inv.id,
            clientName: data.clientName || 'Client',
            amount: inv.amount,
            status: inv.status === 'paid' ? 'Paid' : 'Pending' as const,
            date: inv.createdAt,
            dueDate: inv.dueDate,
            description: data.description || '',
            taxPercentage: data.taxPercentage || 0,
            workspaceId: data.workspaceId,
            createdAt: inv.createdAt,
            paypalEmail: data.paypalEmail || null,
            invoiceNumber: inv.invoiceNumber,
            paymentUrl: inv.paymentUrl,
            currency: inv.currency,
        };
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (invoiceId: string, data: Partial<Invoice>): Promise<Invoice | null> => {
    const workspaceId = data.workspaceId;

    if (!workspaceId) {
        console.error('Workspace ID required for update');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/invoices/${invoiceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                amount: data.amount,
                dueDate: data.dueDate,
                status: data.status === 'Paid' ? 'paid' : 'draft',
            }),
        });

        if (!response.ok) {
            console.error('Failed to update invoice:', response.status);
            return null;
        }

        const result = await response.json();
        const inv = result.invoice;

        return {
            id: inv.id,
            clientName: data.clientName || 'Client',
            amount: inv.amount,
            status: inv.status === 'paid' ? 'Paid' : 'Pending' as const,
            date: inv.createdAt,
            dueDate: inv.dueDate,
            description: data.description || '',
            taxPercentage: data.taxPercentage || 0,
            workspaceId: workspaceId,
            createdAt: inv.createdAt,
            paypalEmail: data.paypalEmail || null,
        };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return null;
    }
};

export const deleteInvoice = async (invoiceId: string, workspaceId?: string): Promise<boolean> => {
    if (!workspaceId) {
        console.error('Workspace ID required for delete');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/invoices/${invoiceId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to delete invoice:', response.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return false;
    }
};
