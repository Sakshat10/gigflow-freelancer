const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface FileComment {
    id: string;
    fileId: string;
    sender: "freelancer" | "client";
    text: string;
    createdAt: string;
}

export interface WorkspaceFile {
    id: string;
    workspaceId: string;
    filename: string;
    size: number;
    uploadedBy: string;
    createdAt: string; // Changed from uploadedAt to match backend
    fileUrl: string;
    storagePath?: string; // Added to match backend
    comments?: FileComment[]; // Made optional since it might not always be included
}

// Freelancer: Get all files for a workspace
export async function fetchFiles(workspaceId: string): Promise<WorkspaceFile[]> {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files`, {
            credentials: "include",
        });

        if (!response.ok) {
            console.error("Failed to fetch files:", response.status);
            return [];
        }

        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error("Error fetching files:", error);
        return [];
    }
}

// Freelancer: Upload a file (using FormData for multipart upload)
export async function uploadFile(workspaceId: string, file: File): Promise<WorkspaceFile | null> {
    try {
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files`, {
            method: "POST",
            credentials: "include",
            body: formData, // Send as FormData, not JSON
        });

        if (!response.ok) {
            console.error("Failed to upload file:", response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error("Error details:", errorData);
            return null;
        }

        const data = await response.json();
        return data.file;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

// Freelancer: Delete a file
export async function deleteFile(workspaceId: string, fileId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files/${fileId}`, {
            method: "DELETE",
            credentials: "include",
        });

        return response.ok;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
}

// Freelancer: Add comment to file
export async function addFileComment(
    workspaceId: string,
    fileId: string,
    text: string
): Promise<FileComment | null> {
    try {
        const response = await fetch(
            `${API_URL}/api/workspaces/${workspaceId}/files/${fileId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ text }),
            }
        );
        
        if (!response.ok) {
            console.error("Failed to add comment:", response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error("Error details:", errorData);
            return null;
        }

        const data = await response.json();
        return data.comment;
    } catch (error) {
        console.error("Error adding comment:", error);
        return null;
    }
}

// Client: Add comment to file (no auth)
export async function addFileCommentAsClient(
    shareToken: string,
    fileId: string,
    text: string
): Promise<FileComment | null> {
    try {
        const response = await fetch(
            `${API_URL}/api/client/${shareToken}/files/${fileId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            }
        );

        if (!response.ok) {
            console.error("Failed to add comment:", response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error("Error details:", errorData);
            return null;
        }

        const data = await response.json();
        return data.comment;
    } catch (error) {
        console.error("Error adding comment:", error);
        return null;
    }
}

// Client: Get file comments (no auth)
export async function fetchFileCommentsAsClient(
    shareToken: string,
    fileId: string
): Promise<FileComment[]> {
    try {
        const response = await fetch(
            `${API_URL}/api/client/${shareToken}/files/${fileId}/comments`
        );

        if (!response.ok) {
            console.error("Failed to fetch comments:", response.status);
            return [];
        }

        const data = await response.json();
        return data.comments || [];
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

// Client: Upload a file (using FormData for multipart upload)
export async function uploadFileAsClient(shareToken: string, file: File): Promise<WorkspaceFile | null> {
    try {
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/client/${shareToken}/files`, {
            method: "POST",
            body: formData, // Send as FormData, not JSON
        });

        if (!response.ok) {
            console.error("Failed to upload file:", response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error("Error details:", errorData);
            return null;
        }

        const data = await response.json();
        return data.file;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

// Client: Get all files for a workspace (no auth)
export async function fetchFilesAsClient(shareToken: string): Promise<WorkspaceFile[]> {
    try {
        const response = await fetch(`${API_URL}/api/client/${shareToken}/files`);

        if (!response.ok) {
            console.error("Failed to fetch files:", response.status);
            return [];
        }

        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error("Error fetching files:", error);
        return [];
    }
}

// Client: Delete a file (only files uploaded by client)
export async function deleteFileAsClient(shareToken: string, fileId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/client/${shareToken}/files/${fileId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to delete file:", response.status, errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
}

// Get file download URL (works for both freelancer and client)
export async function getFileDownloadUrl(
    workspaceId: string, 
    fileId: string, 
    shareToken?: string
): Promise<string | null> {
    try {
        const url = shareToken 
            ? `${API_URL}/api/client/${shareToken}/files/${fileId}/download`
            : `${API_URL}/api/workspaces/${workspaceId}/files/${fileId}/download`;

        const response = await fetch(url, {
            credentials: shareToken ? "omit" : "include",
        });

        if (!response.ok) {
            console.error("Failed to get download URL:", response.status);
            return null;
        }

        const data = await response.json();
        return data.downloadUrl;
    } catch (error) {
        console.error("Error getting download URL:", error);
        return null;
    }
}
