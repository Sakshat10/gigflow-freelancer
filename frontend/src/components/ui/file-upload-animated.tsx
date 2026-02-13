
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, FileText, FileImage, FileVideo, FileAudio, Search, Download, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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

// File size limit: 1GB in bytes
const FILE_SIZE_LIMIT = 1024 * 1024 * 1024;

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUploadAnimated = ({
  onChange,
  onDelete,
}: {
  onChange?: (files: File[]) => void;
  onDelete?: (fileIndex: number) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    // Filter out files that exceed the size limit
    const validFiles = newFiles.filter(file => {
      if (file.size > FILE_SIZE_LIMIT) {
        toast.error(`File "${file.name}" exceeds the 1GB size limit`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      onChange && onChange(validFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const openFilePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const closeFilePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setShowPreview(false);
  };

  const confirmDeleteFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setConfirmDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteFile = () => {
    if (confirmDeleteIndex !== null) {
      if (onDelete) {
        onDelete(confirmDeleteIndex);
      }
      
      const newFiles = [...files];
      newFiles.splice(confirmDeleteIndex, 1);
      setFiles(newFiles);
      
      setShowDeleteConfirmation(false);
      setConfirmDeleteIndex(null);
      toast.success("File removed");
    }
  };

  const cancelDeleteFile = () => {
    setConfirmDeleteIndex(null);
    setShowDeleteConfirmation(false);
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('image')) return <FileImage className="h-4 w-4" />;
    if (type.includes('video')) return <FileVideo className="h-4 w-4" />;
    if (type.includes('audio')) return <FileAudio className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const downloadFile = (e: React.MouseEvent, file: File) => {
    e.stopPropagation();
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
      toast.error("File upload failed. Make sure your file is under 1GB.");
    },
    maxSize: FILE_SIZE_LIMIT,
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePreview(file);
                  }}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                      >
                        {file.name}
                      </motion.p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-1 rounded-full hover:bg-red-100 text-red-500"
                        onClick={(e) => confirmDeleteFile(e, idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                        onClick={(e) => downloadFile(e, file)}
                      >
                        <Download className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                      </motion.button>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    </div>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {file.type || "application/octet-stream"}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && getFileIcon(previewFile)}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <DialogClose 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={closeFilePreview}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <div className="mt-2 max-h-[70vh] overflow-auto">
            {previewFile && previewUrl && (
              <>
                {previewFile.type.includes('image') ? (
                  <img 
                    src={previewUrl} 
                    alt={previewFile.name} 
                    className="max-w-full h-auto rounded-md"
                  />
                ) : previewFile.type.includes('video') ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-w-full h-auto rounded-md"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : previewFile.type.includes('audio') ? (
                  <audio 
                    src={previewUrl} 
                    controls 
                    className="w-full"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                ) : previewFile.type.includes('pdf') && window.navigator.pdfViewerEnabled ? (
                  <iframe 
                    src={previewUrl} 
                    title={previewFile.name}
                    className="w-full h-[60vh] rounded-md border"
                  />
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <Search className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Preview not available for this file type.
                    </p>
                    <button
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 mx-auto"
                      onClick={(e) => downloadFile(e, previewFile)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div>
              {previewFile?.type || "Unknown type"}
            </div>
            <div>
              {previewFile && (previewFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this file? This action cannot be undone.
              {confirmDeleteIndex !== null && files[confirmDeleteIndex] && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm">{files[confirmDeleteIndex].name}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteFile}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFile}
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

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
