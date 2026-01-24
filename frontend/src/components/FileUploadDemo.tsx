import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, Download, Trash2, File } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { getFileDownloadUrl } from '../services/fileService';

interface FileItem {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

interface FileUploadDemoProps {
  workspaceId?: string;
  shareToken?: string;
  isClient?: boolean;
}

export function FileUploadDemo({ workspaceId, shareToken, isClient = false }: FileUploadDemoProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get API base URL
  const getApiUrl = () => {
    if (isClient && shareToken) {
      return `/api/client/${shareToken}/files`;
    }
    return `/api/workspaces/${workspaceId}/files`;
  };

  // Get auth headers
  const getHeaders = () => {
    if (isClient) {
      return {}; // No auth for client
    }
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Load files
  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(), {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File too large. Maximum size is 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setFiles(prev => [data.file, ...prev]);
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully'
      });

      // Clear input
      event.target.value = '';
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Download file
  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const downloadUrl = await getFileDownloadUrl(workspaceId || '', fileId, shareToken);
      
      if (!downloadUrl) {
        throw new Error('Failed to get download URL');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Download started'
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  // Delete file (freelancer only)
  const handleDelete = async (fileId: string) => {
    if (isClient) return; // Clients can't delete

    try {
      const response = await fetch(`${getApiUrl()}/${fileId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      toast({
        title: 'Success',
        description: 'File deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load files on mount
  React.useEffect(() => {
    if (workspaceId || shareToken) {
      loadFiles();
    }
  }, [workspaceId, shareToken]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Files {isClient && '(Client View)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.js,.css,.html,.json"
          />
          <Button 
            onClick={loadFiles} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {uploading && (
          <div className="text-sm text-muted-foreground">
            Uploading file...
          </div>
        )}

        {/* Files List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-sm text-muted-foreground">No files uploaded yet</div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{file.filename}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)} • Uploaded by {file.uploadedBy} • {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file.id, file.filename)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isClient && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          Maximum file size: 10MB. Supported formats: Images, Documents, Archives, Code files.
          {isClient && ' Note: You can upload and download files, but cannot delete them.'}
        </div>
      </CardContent>
    </Card>
  );
}