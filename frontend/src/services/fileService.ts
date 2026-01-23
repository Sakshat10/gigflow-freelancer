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
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
    fileUrl: string;
    comments: FileComment[];
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

// Freelancer: Upload a file (converts to base64 data URL)
export async function uploadFile(workspaceId: string, file: File): Promise<WorkspaceFile | null> {
    try {
        // Convert file to base64 data URL
        const fileUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                filename: file.name,
                size: file.size,
                mimeType: file.type || "application/octet-stream",
                fileUrl: fileUrl,
                uploadedBy: "freelancer",
            }),
        });

        if (!response.ok) {
            console.error("Failed to upload file:", response.status);
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
