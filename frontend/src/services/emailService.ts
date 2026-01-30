// Email service - connects to backend API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: 'welcome' | 'invoice' | 'reminder' | 'custom';
    createdAt?: string;
    updatedAt?: string;
}

export interface SentEmail {
    id: string;
    clientId?: string | null;
    subject: string;
    body: string;
    status: 'draft' | 'sent' | 'failed';
    sentAt: string;
    client?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface SendEmailRequest {
    to?: string | string[];
    clientIds?: string[];
    subject: string;
    body: string;
    saveToHistory?: boolean;
}

export interface SendEmailResponse {
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Check if email service is configured
export const checkEmailStatus = async (): Promise<{ configured: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/emails/status`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to check email status');
    }

    return response.json();
};

// Send email to client(s)
export const sendEmail = async (request: SendEmailRequest): Promise<SendEmailResponse> => {
    const response = await fetch(`${API_URL}/emails/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
    }

    return response.json();
};

// Get email history
export const getEmailHistory = async (
    limit = 50,
    offset = 0,
    clientId?: string
): Promise<{ emails: SentEmail[]; total: number }> => {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
    });

    if (clientId) {
        params.append('clientId', clientId);
    }

    const response = await fetch(`${API_URL}/emails/history?${params}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch email history');
    }

    return response.json();
};

// Get email templates
export const getTemplates = async (): Promise<EmailTemplate[]> => {
    const response = await fetch(`${API_URL}/emails/templates`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }

    const data = await response.json();
    return data.templates || [];
};

// Create email template
export const createTemplate = async (
    name: string,
    subject: string,
    body: string,
    type: EmailTemplate['type'] = 'custom'
): Promise<EmailTemplate> => {
    const response = await fetch(`${API_URL}/emails/templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, subject, body, type })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
    }

    const data = await response.json();
    return data.template;
};

// Update email template
export const updateTemplate = async (
    id: string,
    updates: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<EmailTemplate> => {
    const response = await fetch(`${API_URL}/emails/templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template');
    }

    const data = await response.json();
    return data.template;
};

// Delete email template
export const deleteTemplate = async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/emails/templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to delete template');
    }

    return true;
};

export default {
    checkEmailStatus,
    sendEmail,
    getEmailHistory,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
};
