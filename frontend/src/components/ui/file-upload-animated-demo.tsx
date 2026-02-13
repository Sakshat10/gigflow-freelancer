
"use client";
import React, { useState } from "react";
import { FileUploadAnimated } from "@/components/ui/file-upload-animated";
import toast from "react-hot-toast";

export function FileUploadAnimatedDemo() {
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFileUpload = (files: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...files]);
    console.log(files);
    if (files.length > 0) {
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`, {
        description: `${files[0].name}${files.length > 1 ? ` and ${files.length - 1} more` : ''}`,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUploadAnimated onChange={handleFileUpload} />
    </div>
  );
}
