import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, File, Image, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FileUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  onRemoveFile?: (index: number) => void;
  isSharedView?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUpload, 
  onRemoveFile,
  isSharedView = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // File size limit: 1GB in bytes
  const FILE_SIZE_LIMIT = 1024 * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Filter out files that exceed the size limit
    const validFiles = droppedFiles.filter(file => {
      if (file.size > FILE_SIZE_LIMIT) {
        toast.error(`File "${file.name}" exceeds the 1GB size limit`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Filter out files that exceed the size limit
      const validFiles = selectedFiles.filter(file => {
        if (file.size > FILE_SIZE_LIMIT) {
          toast.error(`File "${file.name}" exceeds the 1GB size limit`);
          return false;
        }
        return true;
      });
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const confirmRemoveFile = (index: number) => {
    setConfirmDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  const handleFileDelete = () => {
    if (confirmDeleteIndex !== null) {
      if (onRemoveFile) {
        onRemoveFile(confirmDeleteIndex);
      }
      
      setFiles(prev => prev.filter((_, i) => i !== confirmDeleteIndex));
      toast.success("File removed");
      
      // Reset state
      setConfirmDeleteIndex(null);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelFileDelete = () => {
    setConfirmDeleteIndex(null);
    setShowDeleteConfirmation(false);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'application':
        return <FileText className="h-5 w-5 text-amber-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  const handleUploadAll = async () => {
    if (!onUpload || files.length === 0) return;
    
    try {
      setUploading(true);
      await onUpload(files);
      setFiles([]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="workspace-files" className="w-full space-y-6">
      <div 
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 transition-all duration-300 bg-white/50",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Drop your files here</h3>
            <p className="text-sm text-gray-500">
              Upload files (up to 1GB) for your client to view and download
            </p>
          </div>
          <div>
            <label htmlFor="file-upload">
              <Button 
                variant="outline" 
                size="lg" 
                className="relative rounded-full px-6 hover-translate"
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                Browse Files
              </Button>
            </label>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-scale-up">
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-medium">Files to upload ({files.length})</h4>
          </div>
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!isSharedView && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => confirmRemoveFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <Button 
              className="rounded-full px-6 hover-translate"
              onClick={handleUploadAll}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload All Files"}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this file? This action cannot be undone.
              {confirmDeleteIndex !== null && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm">{files[confirmDeleteIndex]?.name}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelFileDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFileDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Create a wrapper function to handle the different parameter types
export const createFileUploadHandler = (uploadFunction: (files: File[]) => Promise<void>) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      return uploadFunction(files);
    }
    return Promise.resolve();
  };
};

export default FileUpload;
