import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  FileText,
  MessageSquare,
  Receipt,
  CheckSquare,
  X,
  File,
  Image,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  Send,
  Plus,
  Lock,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Workspace as WorkspaceType } from "@/types";
import { fetchWorkspace } from "@/services/workspace";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { hasFeatureAccess, canSendInvoices } from "@/utils/planFeatures";
import { Input } from "@/components/ui/input";
import CreateWorkspaceForm from "@/components/workspace/CreateWorkspaceForm";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import KanbanBoard from "@/components/workspace/KanbanBoard";
import TaskForm from "@/components/task/TaskForm";
import DocumentGenerator, { SavedDocument } from "@/components/documents/DocumentGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchInvoices, deleteInvoice } from "@/services/invoiceService";
import { fetchTasks, updateTask as updateTaskService, deleteTask as deleteTaskService } from "@/services/taskService";
import {
  fetchMessages,
  sendMessage,
  joinWorkspace as joinWorkspaceSocket,
  leaveWorkspace as leaveWorkspaceSocket,
  onNewMessage,
  offNewMessage,
  sendMessageSocket,
  ChatMessage,
  emitFileUploaded,
  emitFileDeleted,
  emitFileCommentAdded,
  onFileUploaded,
  onFileDeleted,
  onFileCommentAdded,
  offFileUploaded,
  offFileDeleted,
  offFileCommentAdded,
  emitInvoiceCreated,
  emitInvoiceDeleted,
  onInvoiceCreated,
  onInvoiceDeleted,
  offInvoiceCreated,
  offInvoiceDeleted,
  emitTaskCreated,
  emitTaskStatusUpdated,
  emitTaskDeleted,
  onTaskCreated,
  onTaskStatusUpdated,
  onTaskDeleted,
  offTaskCreated,
  offTaskStatusUpdated,
  offTaskDeleted,
} from "@/services/chatService";
import {
  fetchFiles,
  uploadFile,
  deleteFile,
  addFileComment,
  getFileDownloadUrl,
  WorkspaceFile,
  FileComment,
} from "@/services/fileService";
import { downloadInvoicePDF } from "@/utils/invoice-pdf";
import { Steps } from 'intro.js-react';
import { useIntroTour, TourStep } from "@/hooks/use-intro-tour";
import 'intro.js/introjs.css';
import { Invoice, Thing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Download, ExternalLink, Trash2, Clock, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasDocsAccess = hasFeatureAccess(user?.plan, "documents");
  const canSendInvoice = canSendInvoices(user?.plan);
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("files");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [previewDocument, setPreviewDocument] = useState<SavedDocument | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState<Thing['status']>("todo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isCreating = id === "new";

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<WorkspaceFile[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [newFileComment, setNewFileComment] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; filename: string; url: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; filename: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [isInvoiceDeleteDialogOpen, setIsInvoiceDeleteDialogOpen] = useState(false);

  // Handle file preview
  const handlePreviewFile = async (fileId: string, filename: string) => {
    if (!id) return;

    try {
      const downloadUrl = await getFileDownloadUrl(id, fileId);
      if (downloadUrl) {
        setPreviewFile({ id: fileId, filename, url: downloadUrl });
        setIsPreviewOpen(true);
      } else {
        toast.error('Failed to load file preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to load file preview');
    }
  };

  // Check if file is previewable
  const isPreviewable = (filename: string): boolean => {
    const extension = filename.toLowerCase().split('.').pop() || '';
    const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt', 'md'];
    return previewableTypes.includes(extension);
  };

  // Handle file selection (upload to backend)
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !id) return;

    setUploadingFile(true);
    setIsUploadDialogOpen(false);

    try {
      for (const file of Array.from(files)) {
        console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
        const uploadedFile = await uploadFile(id, file);
        
        if (uploadedFile) {
          // Ensure the uploaded file has all required fields
          const fileWithDefaults = {
            ...uploadedFile,
            comments: uploadedFile.comments || []
          };
          
          setUploadedFiles(prev => [fileWithDefaults, ...prev]);
          toast.success(`${file.name} uploaded successfully`);
          
          // Emit socket event for real-time sync
          emitFileUploaded({
            workspaceId: id,
            file: fileWithDefaults
          });
        } else {
          toast.error(`Failed to upload ${file.name}. Check console for details.`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s). Check console for details.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Add comment to file (via backend)
  const handleAddComment = async (fileId: string) => {
    if (!newFileComment.trim() || !id) return;

    const comment = await addFileComment(id, fileId, newFileComment.trim());
    
    if (comment) {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            comments: [...(file.comments || []), comment],
          };
        }
        return file;
      }));
      setNewFileComment('');
      
      // Emit socket event for real-time sync
      emitFileCommentAdded({
        workspaceId: id,
        fileId,
        comment
      });
    } else {
      toast.error('Failed to add comment');
    }
  };

  // Handle drag events
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
    handleFileSelect(e.dataTransfer.files);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (fileId: string, filename: string) => {
    setFileToDelete({ id: fileId, filename });
    setIsDeleteDialogOpen(true);
  };

  // Delete file (via backend)
  const handleDeleteFile = async () => {
    if (!id || !fileToDelete) return;

    const success = await deleteFile(id, fileToDelete.id);
    if (success) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      toast.success('File deleted');
      
      // Emit socket event for real-time sync
      emitFileDeleted({
        workspaceId: id,
        fileId: fileToDelete.id
      });
    } else {
      toast.error('Failed to delete file');
    }
    
    setIsDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  // Open invoice delete confirmation dialog
  const openInvoiceDeleteDialog = (invoiceId: string, invoiceNumber: string) => {
    setInvoiceToDelete({ id: invoiceId, invoiceNumber });
    setIsInvoiceDeleteDialogOpen(true);
  };

  // Delete invoice (via backend)
  const handleDeleteInvoice = async () => {
    if (!id || !invoiceToDelete) return;

    const success = await deleteInvoice(invoiceToDelete.id, id);
    if (success) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      toast.success("Invoice deleted");
      
      // Emit socket event for real-time sync
      emitInvoiceDeleted({
        workspaceId: id,
        invoiceId: invoiceToDelete.id
      });
    } else {
      toast.error("Failed to delete invoice");
    }
    
    setIsInvoiceDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  // Handle document save
  const handleDocumentSaved = (document: SavedDocument) => {
    if (!id) return;
    
    const updatedDocs = [...savedDocuments, document];
    setSavedDocuments(updatedDocs);
    localStorage.setItem(`documents_${id}`, JSON.stringify(updatedDocs));
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string) => {
    setDocumentToDelete(docId);
  };

  const confirmDeleteDocument = () => {
    if (!id || !documentToDelete) return;
    
    const updatedDocs = savedDocuments.filter(doc => doc.id !== documentToDelete);
    setSavedDocuments(updatedDocs);
    localStorage.setItem(`documents_${id}`, JSON.stringify(updatedDocs));
    setDocumentToDelete(null);
    setPreviewDocument(null);
    toast.success('Document deleted');
  };

  const handleDownloadDocument = (doc: SavedDocument) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  // Handle file download
  const handleDownloadFile = async (fileId: string, filename: string) => {
    if (!id) return;

    try {
      const downloadUrl = await getFileDownloadUrl(id, fileId);
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon based on filename extension
  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop() || '';
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
      return <FileAudio className="h-5 w-5 text-green-500" />;
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    
    // Default file icon
    return <File className="h-5 w-5 text-gray-500" />;
  };
  const shouldShowTour = searchParams.get('tour') === 'true';

  // Intro tour for workspace
  const {
    tourConfig,
    startTour,
    hasSeenTour,
    isFirstWorkspace,
    onExit,
    onComplete
  } = useIntroTour(`workspace-${id}`);

  useEffect(() => {
    if (isCreating) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [wsData, invData, taskData, msgData, filesData] = await Promise.all([
          fetchWorkspace(id),
          fetchInvoices(id),
          fetchTasks(id),
          fetchMessages(id),
          fetchFiles(id)
        ]);
        setWorkspace(wsData);
        setInvoices(invData);
        setTasks(taskData);
        setMessages(msgData);
        setUploadedFiles(filesData);
        
        // Load saved documents from localStorage
        const storedDocs = localStorage.getItem(`documents_${id}`);
        if (storedDocs) {
          setSavedDocuments(JSON.parse(storedDocs));
        }
      } catch (error) {
        console.error("Error loading workspace data:", error);
        toast.error("Failed to load workspace data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isCreating]);

  // Socket connection for real-time chat and file/invoice/task sync
  useEffect(() => {
    if (!id || isCreating) return;

    // Join workspace room
    joinWorkspaceSocket(id);

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    // Listen for file uploaded
    const handleFileUploaded = (data: any) => {
      console.log('[Workspace] File uploaded event received:', data);
      setUploadedFiles(prev => {
        // Avoid duplicates
        if (prev.some(f => f.id === data.file.id)) return prev;
        return [data.file, ...prev];
      });
    };

    // Listen for file deleted
    const handleFileDeleted = (data: any) => {
      console.log('[Workspace] File deleted event received:', data);
      setUploadedFiles(prev => prev.filter(f => f.id !== data.fileId));
    };

    // Listen for file comment added
    const handleFileCommentAdded = (data: any) => {
      console.log('[Workspace] File comment added event received:', data);
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === data.fileId) {
          // Avoid duplicate comments
          if (file.comments?.some(c => c.id === data.comment.id)) return file;
          return {
            ...file,
            comments: [...(file.comments || []), data.comment]
          };
        }
        return file;
      }));
    };

    // Listen for invoice created
    const handleInvoiceCreated = (data: any) => {
      console.log('[Workspace] Invoice created event received:', data);
      setInvoices(prev => {
        // Avoid duplicates
        if (prev.some(inv => inv.id === data.invoice.id)) return prev;
        return [data.invoice, ...prev];
      });
    };

    // Listen for invoice deleted
    const handleInvoiceDeleted = (data: any) => {
      console.log('[Workspace] Invoice deleted event received:', data);
      setInvoices(prev => prev.filter(inv => inv.id !== data.invoiceId));
    };

    // Listen for task created
    const handleTaskCreated = (data: any) => {
      console.log('[Workspace] Task created event received:', data);
      setTasks(prev => {
        // Avoid duplicates
        if (prev.some(t => t.id === data.task.id)) return prev;
        return [data.task, ...prev];
      });
    };

    // Listen for task status updated
    const handleTaskStatusUpdated = (data: any) => {
      console.log('[Workspace] Task status updated event received:', data);
      setTasks(prev => prev.map(t => 
        t.id === data.task.id ? data.task : t
      ));
    };

    // Listen for task deleted
    const handleTaskDeleted = (data: any) => {
      console.log('[Workspace] Task deleted event received:', data);
      setTasks(prev => prev.filter(t => t.id !== data.taskId));
    };

    onNewMessage(handleNewMessage);
    onFileUploaded(handleFileUploaded);
    onFileDeleted(handleFileDeleted);
    onFileCommentAdded(handleFileCommentAdded);
    onInvoiceCreated(handleInvoiceCreated);
    onInvoiceDeleted(handleInvoiceDeleted);
    onTaskCreated(handleTaskCreated);
    onTaskStatusUpdated(handleTaskStatusUpdated);
    onTaskDeleted(handleTaskDeleted);

    return () => {
      offNewMessage(handleNewMessage);
      offFileUploaded(handleFileUploaded);
      offFileDeleted(handleFileDeleted);
      offFileCommentAdded(handleFileCommentAdded);
      offInvoiceCreated(handleInvoiceCreated);
      offInvoiceDeleted(handleInvoiceDeleted);
      offTaskCreated(handleTaskCreated);
      offTaskStatusUpdated(handleTaskStatusUpdated);
      offTaskDeleted(handleTaskDeleted);
      leaveWorkspaceSocket(id);
    };
  }, [id, isCreating]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      // Save to database
      const savedMessage = await sendMessage(id, messageText);

      if (savedMessage) {
        // Broadcast via socket for real-time update (with full message including ID)
        sendMessageSocket(savedMessage);

        // Add to local state immediately for the sender
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMessage.id)) return prev;
          return [...prev, savedMessage];
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  // Start workspace tour when first workspace is created
  useEffect(() => {
    // Check localStorage directly for latest values
    const tourKey = `tour_completed_workspace-${id}`;
    const hasCompletedTour = localStorage.getItem(tourKey) === 'true';
    const isFirstWs = localStorage.getItem('first_workspace_created') !== 'true';

    // Check session flag
    const hasTriggeredThisSession = sessionStorage.getItem(`workspace_tour_triggered_${id}`) === 'true';

    if (!loading && workspace && (shouldShowTour || isFirstWs) && !hasCompletedTour && !hasTriggeredThisSession) {
      sessionStorage.setItem(`workspace_tour_triggered_${id}`, 'true');
      const timer = setTimeout(() => {
        const steps: TourStep[] = [
          {
            element: '#workspace-header',
            title: '🎉 Welcome to your Workspace!',
            intro: 'This is where you manage everything for this client - files, chat, invoices, and more.',
            position: 'bottom',
          },
          {
            element: '#tab-files',
            title: '📁 Files',
            intro: 'Upload and share documents, images, and any files with your client.',
            position: 'bottom',
          },
          {
            element: '#tab-chat',
            title: '💬 Chat',
            intro: 'Have real-time conversations with your client. Keep all project discussions in one place.',
            position: 'bottom',
          },
          {
            element: '#tab-invoices',
            title: '💰 Invoices',
            intro: 'Create professional invoices and track payments.',
            position: 'bottom',
          },
          {
            element: '#tab-documents',
            title: '📝 Documents',
            intro: 'Generate contracts, proposals, and other documents using AI-powered templates.',
            position: 'bottom',
          },
          {
            element: '#tab-tasks',
            title: '✅ Tasks',
            intro: 'Track project milestones, deliverables, and to-dos.',
            position: 'bottom',
          },
          {
            element: '#share-btn',
            title: '🔗 Share Workspace',
            intro: 'Click here to get a shareable link. Your client can access the workspace without logging in!',
            position: 'left',
          },
        ];
        startTour(steps);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [loading, workspace, shouldShowTour, id, startTour]);

  const handleShareWorkspace = () => {
    const shareableLink = `${window.location.origin}/share/${workspace?.shareToken || id}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    green: "bg-green-50 border-green-200",
    amber: "bg-amber-50 border-amber-200",
    pink: "bg-pink-50 border-pink-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-3xl mx-auto w-full">
            <CreateWorkspaceForm
              onWorkspaceCreated={(newWorkspace) => {
                navigate(`/workspace/${newWorkspace.id}?tour=true`);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Workspace not found</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const headerClass = colorMap[workspace.color] || colorMap.blue;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Intro.js Steps */}
      <Steps
        enabled={tourConfig.enabled}
        steps={tourConfig.steps}
        initialStep={tourConfig.initialStep || 0}
        onExit={onExit}
        onComplete={onComplete}
        options={tourConfig.options}
      />

      {/* Workspace Header */}
      <header id="workspace-header" className={`${headerClass} border-b`}>
        <div className="max-w-7xl mx-auto w-full px-4 py-8 pt-24">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{workspace.name}</h1>
                  {workspace.description && (
                    <p className="text-sm mt-1 opacity-80 max-w-2xl">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  id="share-btn"
                  variant="outline"
                  className="rounded-full px-4 bg-white/70"
                  onClick={handleShareWorkspace}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-6">
            <TabsTrigger id="tab-files" value="files" className="flex gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger id="tab-chat" value="chat" className="flex gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger id="tab-invoices" value="invoices" className="flex gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger
              id="tab-documents"
              value="documents"
              className={`flex gap-2 ${!hasDocsAccess ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!hasDocsAccess}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="hidden sm:inline">Docs</span>
                      {!hasDocsAccess && <Lock className="h-3 w-3 ml-1" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white">
                    {hasDocsAccess ? (
                      <p>📝 Generate documents</p>
                    ) : (
                      <p>🔒 Pro Plus feature</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger id="tab-tasks" value="things" className="flex gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files">
            <FadeIn>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Files</CardTitle>
                  <Button className="rounded-full" onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary fallback={<div className="p-4 text-red-600">Error loading files</div>}>
                    {uploadedFiles.length === 0 ? (
                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">Drop files here or click to upload</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Supported formats: Images, PDFs, Documents, Videos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadedFiles.map((file) => {
                        try {
                          return (
                            <div
                              key={file.id}
                              className="rounded-xl border border-gray-100 overflow-hidden transition-all"
                            >
                              {/* File Header */}
                              <div className="flex items-center justify-between p-4 hover:bg-primary/5 group">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    {getFileIcon(file.filename)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{file.filename}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                            <div className="flex items-center gap-2">
                              {/* Comments toggle button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-gray-500 hover:text-primary"
                                onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs">{file.comments?.length || 0}</span>
                                {expandedFileId === file.id ? (
                                  <ChevronUp className="h-3 w-3 ml-1" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                )}
                              </Button>
                              {isPreviewable(file.filename) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full"
                                  onClick={() => handlePreviewFile(file.id, file.filename)}
                                  title="Preview file"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => handleDownloadFile(file.id, file.filename)}
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {/* Only show delete button if uploaded by freelancer */}
                              {file.uploadedBy === 'freelancer' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full text-red-500 hover:text-red-600"
                                  onClick={() => openDeleteDialog(file.id, file.filename)}
                                  title="Delete file"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Comments Section (Expandable) */}
                          {expandedFileId === file.id && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                              {/* Comment List */}
                              {file.comments && file.comments.length > 0 ? (
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                  {file.comments.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className={`flex ${comment.sender === 'freelancer' ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div
                                        className={`max-w-[80%] rounded-xl px-3 py-2 ${comment.sender === 'freelancer'
                                          ? 'bg-primary text-white'
                                          : 'bg-white border border-gray-200'
                                          }`}
                                      >
                                        <p className="text-sm">{comment.text}</p>
                                        <p className={`text-xs mt-1 ${comment.sender === 'freelancer' ? 'text-white/70' : 'text-gray-400'}`}>
                                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 text-center mb-4">No comments yet</p>
                              )}

                              {/* Add Comment Input */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a comment..."
                                  value={newFileComment}
                                  onChange={(e) => setNewFileComment(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(file.id);
                                    }
                                  }}
                                  className="flex-1 rounded-full text-sm"
                                />
                                <Button
                                  size="icon"
                                  className="rounded-full"
                                  onClick={() => handleAddComment(file.id)}
                                  disabled={!newFileComment.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                          );
                        } catch (error) {
                          console.error('Error rendering file:', file, error);
                          return (
                            <div key={file.id} className="p-4 border border-red-200 rounded-xl bg-red-50">
                              <p className="text-red-600 text-sm">Error displaying file: {file.filename || 'Unknown'}</p>
                            </div>
                          );
                        }
                      })}
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        <p className="text-sm text-gray-500">Drop more files here or click to upload</p>
                      </div>
                    </div>
                  )}
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* File Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <FadeIn>
              <Card className="h-[calc(100vh-300px)] min-h-[400px] max-h-[600px] flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle>Chat with {workspace.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">
                          Start the conversation with your client
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'freelancer' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'freelancer'
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-white border border-gray-200 rounded-bl-sm'
                                }`}
                            >
                              <p className="text-sm break-all">{msg.text}</p>
                              <p className={`text-xs mt-1 ${msg.sender === 'freelancer' ? 'text-white/70' : 'text-gray-400'
                                }`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      className="flex-1 rounded-full"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                    />
                    <Button
                      className="rounded-full"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <FadeIn>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {canSendInvoice 
                        ? "Manage billing and payments for this workspace."
                        : `Create draft invoices (${invoices.length}/3 used). Upgrade to Pro to send them to clients.`}
                    </p>
                  </div>
                  {!canSendInvoice && invoices.length >= 3 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            className="rounded-full" 
                            onClick={() => {
                              navigate("/settings?tab=pricing");
                              toast.info("Upgrade to Pro to create unlimited invoices");
                            }}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Upgrade to Create More
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-gray-900 text-white">
                          <p>Free plan limit: 3 draft invoices per workspace</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button className="rounded-full" onClick={() => setIsInvoiceDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No invoices yet</p>
                      <p className="text-sm mt-1">
                        Create invoices for this client
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invoices.map((invoice) => {
                        const isDraft = invoice.status?.toLowerCase() === 'draft';
                        const isPaid = invoice.status === 'Paid';
                        
                        return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Receipt className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{invoice.clientName}</p>
                                {isDraft && !canSendInvoice && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Lock className="h-3 w-3 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="bg-gray-900 text-white">
                                        <p>Upgrade to Pro to send invoices</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>
                                  {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                                </span>
                                <span>•</span>
                                <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-lg">${((invoice.amount || 0) * (1 + (invoice.taxPercentage || 0) / 100)).toFixed(2)}</p>
                              <Badge 
                                variant={isPaid ? 'outline' : 'secondary'} 
                                className={
                                  isPaid
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : isDraft
                                    ? 'bg-gray-50 text-gray-700 border-gray-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }
                              >
                                {isDraft ? 'Draft' : invoice.status}
                              </Badge>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl">
                                {isDraft && !canSendInvoice ? (
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer text-primary"
                                    onClick={() => {
                                      navigate("/settings?tab=pricing");
                                      toast.info("Upgrade to Pro to send invoices to clients");
                                    }}
                                  >
                                    <Lock className="h-4 w-4" />
                                    Upgrade to Send
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => downloadInvoicePDF(invoice)}
                                >
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => openInvoiceDeleteDialog(
                                    invoice.id, 
                                    invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
              <InvoiceForm
                workspaceId={id || ""}
                clientName={workspace.name}
                onInvoiceCreated={(newInvoice) => {
                  setInvoices(prev => [newInvoice, ...prev]);
                  setIsInvoiceDialogOpen(false);
                  
                  // Show different messages based on invoice status
                  if (newInvoice.status?.toLowerCase() === 'draft' && !canSendInvoice) {
                    toast.success("Invoice draft created! Upgrade to Pro to send it to your client.", {
                      duration: 5000,
                    });
                  } else {
                    toast.success("Invoice created successfully!");
                  }
                  
                  // Emit socket event for real-time sync
                  if (id) {
                    emitInvoiceCreated({
                      workspaceId: id,
                      invoice: newInvoice
                    });
                  }
                }}
                onCancel={() => setIsInvoiceDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Document Generation Dialog */}
          <DocumentGenerator
            isOpen={isDocumentDialogOpen}
            onClose={() => setIsDocumentDialogOpen(false)}
            workspaceName={workspace?.name}
            onDocumentSaved={handleDocumentSaved}
          />

          {/* Document Preview Dialog */}
          <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{previewDocument?.title}</DialogTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (previewDocument) {
                          navigator.clipboard.writeText(previewDocument.content);
                          toast.success("Copied to clipboard");
                        }
                      }}
                    >
                      <File className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (previewDocument) {
                          handleDownloadDocument(previewDocument);
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (previewDocument) {
                          handleDeleteDocument(previewDocument.id);
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-8 max-h-[70vh] overflow-y-auto">
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {previewDocument?.content}
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p>
                  This document is AI-generated and provided for general reference only. 
                  Please consult a qualified legal professional before signing or sharing.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this document? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteDocument} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <FadeIn>
              <Card className="relative overflow-hidden">
                {!hasDocsAccess && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="bg-primary/10 rounded-full p-4 mb-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Pro Plus Feature</h3>
                    <p className="text-gray-500 text-center max-w-md px-4">
                      Upgrade to Pro Plus to unlock AI-powered document generation. Create contracts, proposals, and more with just a few clicks!
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate("/settings?tab=pricing")}
                    >
                      Upgrade to Pro Plus
                    </Button>
                  </div>
                )}
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  <Button 
                    className="rounded-full" 
                    disabled={!hasDocsAccess}
                    onClick={() => setIsDocumentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Draft
                  </Button>
                </CardHeader>
                <CardContent>
                  {savedDocuments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents yet</p>
                      <p className="text-sm mt-1">
                        Generate contracts, proposals, and more
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedDocuments.map((doc) => (
                        <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex items-start gap-3 flex-1 cursor-pointer"
                              onClick={() => setPreviewDocument(doc)}
                            >
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate hover:text-primary transition-colors">
                                  {doc.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {doc.type.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc)}
                                title="Download"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                                title="Delete"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* Things/Tasks Tab */}
          <TabsContent value="things">
            <FadeIn>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Project Tasks</h2>
                    <p className="text-muted-foreground text-sm">Organize and track your workflow with a Kanban board.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="rounded-full bg-primary shadow-lg shadow-primary/20"
                      onClick={() => {
                        setInitialTaskStatus("todo");
                        setIsTaskDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>

                <div className="bg-white/50 rounded-3xl p-1 min-h-[600px]">
                  <KanbanBoard
                    tasks={tasks}
                    onUpdateStatus={async (taskId, status) => {
                      const updated = await updateTaskService(taskId, { status, workspaceId: id });
                      if (updated) {
                        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
                        
                        // Emit socket event for real-time sync
                        if (id) {
                          emitTaskStatusUpdated({
                            workspaceId: id,
                            task: updated
                          });
                        }
                      }
                    }}
                    onAddTask={(status) => {
                      setInitialTaskStatus(status);
                      setIsTaskDialogOpen(true);
                    }}
                    onDeleteTask={async (taskId) => {
                      if (await deleteTaskService(taskId, id)) {
                        setTasks(prev => prev.filter(t => t.id !== taskId));
                        toast.success("Task deleted");
                        
                        // Emit socket event for real-time sync
                        if (id) {
                          emitTaskDeleted({
                            workspaceId: id,
                            taskId
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </FadeIn>
          </TabsContent>

          {/* Task Dialog */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
              <TaskForm
                workspaceId={id || ""}
                initialStatus={initialTaskStatus}
                onTaskCreated={(newTask) => {
                  setTasks(prev => [newTask, ...prev]);
                  setIsTaskDialogOpen(false);
                  toast.success("Task added to board!");
                  
                  // Emit socket event for real-time sync
                  if (id) {
                    emitTaskCreated({
                      workspaceId: id,
                      task: newTask
                    });
                  }
                }}
                onCancel={() => setIsTaskDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* File Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {previewFile?.filename}
                </DialogTitle>
              </DialogHeader>
              <div className="px-6 pb-6 overflow-auto max-h-[calc(90vh-100px)]">
                {previewFile && (
                  <>
                    {/* Image Preview */}
                    {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(previewFile.filename) && (
                      <img
                        src={previewFile.url}
                        alt={previewFile.filename}
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                    
                    {/* PDF Preview */}
                    {/\.pdf$/i.test(previewFile.filename) && (
                      <iframe
                        src={previewFile.url}
                        className="w-full h-[70vh] rounded-lg border"
                        title={previewFile.filename}
                      />
                    )}
                    
                    {/* Text Preview */}
                    {/\.(txt|md)$/i.test(previewFile.filename) && (
                      <iframe
                        src={previewFile.url}
                        className="w-full h-[70vh] rounded-lg border bg-white p-4"
                        title={previewFile.filename}
                      />
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete File</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">"{fileToDelete?.filename}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setFileToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteFile}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Invoice Delete Confirmation Dialog */}
          <Dialog open={isInvoiceDeleteDialogOpen} onOpenChange={setIsInvoiceDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Invoice</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">
                  Are you sure you want to delete invoice <span className="font-semibold">"{invoiceToDelete?.invoiceNumber}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsInvoiceDeleteDialogOpen(false);
                    setInvoiceToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteInvoice}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  );
};

export default Workspace;
