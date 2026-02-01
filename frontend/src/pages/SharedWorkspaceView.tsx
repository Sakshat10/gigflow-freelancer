import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Share2,
  FileText,
  MessageSquare,
  Receipt,
  CheckSquare,
  Download,
  Send,
  User,
  Loader2,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Bell,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Eye,
  Trash2
} from "lucide-react";
import {
  fetchMessagesAsClient,
  sendMessageAsClient,
  joinWorkspace as joinWorkspaceSocket,
  leaveWorkspace as leaveWorkspaceSocket,
  onNewMessage,
  offNewMessage,
  sendMessageSocket,
  emitInvoicePaid,
  onClientNotification,
  offClientNotification,
  ChatMessage,
  ClientNotification,
  emitFileUploaded,
  emitFileDeleted,
  emitFileCommentAdded,
  onFileUploaded,
  onFileDeleted,
  onFileCommentAdded,
  offFileUploaded,
  offFileDeleted,
  offFileCommentAdded,
  onInvoiceCreated,
  onInvoiceDeleted,
  offInvoiceCreated,
  offInvoiceDeleted,
  onTaskCreated,
  onTaskStatusUpdated,
  onTaskDeleted,
  offTaskCreated,
  offTaskStatusUpdated,
  offTaskDeleted,
} from "@/services/chatService";
import {
  fetchFilesAsClient,
  uploadFileAsClient,
  addFileCommentAsClient,
  getFileDownloadUrl,
  deleteFileAsClient,
  WorkspaceFile,
} from "@/services/fileService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface SharedWorkspace {
  id: string;
  name: string;
  description?: string;
  freelancerName: string;
  createdAt: string;
  updatedAt: string;
  files: Array<{
    id: string;
    filename: string;
    size: number;
    uploadedBy: string;
    createdAt: string;
    fileUrl: string;
    comments?: Array<{
      id: string;
      sender: 'freelancer' | 'client';
      text: string;
      createdAt: string;
    }>;
  }>;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    createdAt: string;
  }>;
  todos: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    taxPercentage?: number;
    dueDate: string;
    status: string;
    createdAt: string;
    invoiceNumber?: string;
    paymentUrl?: string;
    currency?: string;
  }>;
}

const SharedWorkspaceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<SharedWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("files");
  const [newMessage, setNewMessage] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<SharedWorkspace['invoices'][0] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize client notifications from localStorage
  const [clientNotifications, setClientNotifications] = useState<ClientNotification[]>(() => {
    if (!id) return [];
    try {
      const stored = localStorage.getItem(`client_notifications_${id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading notifications from localStorage:', e);
    }
    return [];
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [newFileComment, setNewFileComment] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<{ id: string; filename: string; url: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; filename: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle file preview
  const handlePreviewFile = async (fileId: string, filename: string) => {
    if (!id) return;

    try {
      const downloadUrl = await getFileDownloadUrl('', fileId, id); // Use shareToken for client
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

  // Handle file upload for client
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !id) return;

    setUploadingFile(true);

    try {
      for (const file of Array.from(files)) {
        const uploadedFile = await uploadFileAsClient(id, file);
        
        if (uploadedFile) {
          // Add the new file to the workspace
          setWorkspace(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              files: [uploadedFile, ...prev.files]
            };
          });
          
          // Emit socket event for real-time sync
          if (workspace) {
            emitFileUploaded({
              workspaceId: workspace.id,
              file: uploadedFile
            });
          }
        }
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (fileId: string, filename: string) => {
    setFileToDelete({ id: fileId, filename });
    setIsDeleteDialogOpen(true);
  };

  // Handle file delete (client can only delete their own files)
  const handleDeleteFile = async () => {
    if (!id || !fileToDelete) return;

    // Find the file to check uploadedBy
    const file = workspace?.files.find(f => f.id === fileToDelete.id);
    console.log('File to delete:', file);
    
    if (!file) {
      toast.error('File not found');
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
      return;
    }

    if (file.uploadedBy !== 'client') {
      toast.error('You can only delete files you uploaded');
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
      return;
    }

    try {
      console.log('Attempting to delete file:', fileToDelete.id, 'with shareToken:', id);
      const success = await deleteFileAsClient(id, fileToDelete.id);
      if (success) {
        setWorkspace(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            files: prev.files.filter(f => f.id !== fileToDelete.id)
          };
        });
        toast.success('File deleted');
        
        // Emit socket event for real-time sync
        if (workspace) {
          emitFileDeleted({
            workspaceId: workspace.id,
            fileId: fileToDelete.id
          });
        }
      } else {
        toast.error('Failed to delete file. Check console for details.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file. Check console for details.');
    }
    
    setIsDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  // Add comment to file (via API)
  const handleAddFileComment = async (fileId: string) => {
    if (!newFileComment.trim() || !id) return;

    try {
      const comment = await addFileCommentAsClient(id, fileId, newFileComment.trim());
      
      if (comment) {
        // Update the workspace files with the new comment
        setWorkspace(prev => {
          if (!prev) return prev;
          const updatedWorkspace = {
            ...prev,
            files: prev.files.map(file => {
              if (file.id === fileId) {
                return {
                  ...file,
                  comments: [...(file.comments || []), comment]
                };
              }
              return file;
            })
          };
          return updatedWorkspace;
        });
        setNewFileComment('');
        toast.success('Comment added');
        
        // Emit socket event for real-time sync
        if (workspace) {
          emitFileCommentAdded({
            workspaceId: workspace.id,
            fileId,
            comment
          });
        }
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Handle file download
  const handleDownloadFile = async (fileId: string, filename: string) => {
    if (!id) return;

    try {
      const downloadUrl = await getFileDownloadUrl('', fileId, id); // Use shareToken for client
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

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (id && clientNotifications.length > 0) {
      localStorage.setItem(`client_notifications_${id}`, JSON.stringify(clientNotifications));
    } else if (id && clientNotifications.length === 0) {
      localStorage.removeItem(`client_notifications_${id}`);
    }
  }, [id, clientNotifications]);
  useEffect(() => {
    const fetchSharedWorkspace = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch workspace data
        const response = await fetch(`${API_URL}/api/client/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Workspace not found or link has expired");
          } else {
            setError("Failed to load workspace");
          }
          return;
        }

        const data = await response.json();
        
        // Fetch files with comments separately
        const filesWithComments = await fetchFilesAsClient(id);
        
        // Update workspace with files that include comments
        const workspaceWithComments = {
          ...data.workspace,
          files: filesWithComments
        };
        
        setWorkspace(workspaceWithComments);
      } catch (err) {
        console.error("Error fetching shared workspace:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWorkspace();
  }, [id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load messages and connect socket
  useEffect(() => {
    if (!id || !workspace) return;

    const loadMessages = async () => {
      const msgs = await fetchMessagesAsClient(id);
      setMessages(msgs);
    };

    loadMessages();

    // Join workspace room using actual workspace ID for real-time updates
    joinWorkspaceSocket(workspace.id);

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    // Listen for client notifications from freelancer
    const handleClientNotification = (notification: ClientNotification) => {
      console.log('[Client] Received notification:', notification);
      setClientNotifications(prev => [notification, ...prev]);
      toast(`${notification.title}: ${notification.description}`);
    };

    // Listen for file uploaded
    const handleFileUploaded = (data: any) => {
      console.log('[SharedWorkspace] File uploaded event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        // Avoid duplicates
        if (prev.files.some(f => f.id === data.file.id)) return prev;
        return {
          ...prev,
          files: [data.file, ...prev.files]
        };
      });
    };

    // Listen for file deleted
    const handleFileDeleted = (data: any) => {
      console.log('[SharedWorkspace] File deleted event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          files: prev.files.filter(f => f.id !== data.fileId)
        };
      });
    };

    // Listen for file comment added
    const handleFileCommentAdded = (data: any) => {
      console.log('[SharedWorkspace] File comment added event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          files: prev.files.map(file => {
            if (file.id === data.fileId) {
              // Avoid duplicate comments
              if (file.comments?.some(c => c.id === data.comment.id)) return file;
              return {
                ...file,
                comments: [...(file.comments || []), data.comment]
              };
            }
            return file;
          })
        };
      });
    };

    // Listen for invoice created
    const handleInvoiceCreated = (data: any) => {
      console.log('[SharedWorkspace] Invoice created event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        // Avoid duplicates
        if (prev.invoices.some(inv => inv.id === data.invoice.id)) return prev;
        return {
          ...prev,
          invoices: [data.invoice, ...prev.invoices]
        };
      });
    };

    // Listen for invoice deleted
    const handleInvoiceDeleted = (data: any) => {
      console.log('[SharedWorkspace] Invoice deleted event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          invoices: prev.invoices.filter(inv => inv.id !== data.invoiceId)
        };
      });
    };

    // Listen for task created
    const handleTaskCreated = (data: any) => {
      console.log('[SharedWorkspace] Task created event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        // Avoid duplicates
        if (prev.todos.some(t => t.id === data.task.id)) return prev;
        return {
          ...prev,
          todos: [data.task, ...prev.todos]
        };
      });
    };

    // Listen for task status updated
    const handleTaskStatusUpdated = (data: any) => {
      console.log('[SharedWorkspace] Task status updated event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          todos: prev.todos.map(t => 
            t.id === data.task.id ? data.task : t
          )
        };
      });
    };

    // Listen for task deleted
    const handleTaskDeleted = (data: any) => {
      console.log('[SharedWorkspace] Task deleted event received:', data);
      setWorkspace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          todos: prev.todos.filter(t => t.id !== data.taskId)
        };
      });
    };

    onNewMessage(handleNewMessage);
    onClientNotification(handleClientNotification);
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
      offClientNotification(handleClientNotification);
      offFileUploaded(handleFileUploaded);
      offFileDeleted(handleFileDeleted);
      offFileCommentAdded(handleFileCommentAdded);
      offInvoiceCreated(handleInvoiceCreated);
      offInvoiceDeleted(handleInvoiceDeleted);
      offTaskCreated(handleTaskCreated);
      offTaskStatusUpdated(handleTaskStatusUpdated);
      offTaskDeleted(handleTaskDeleted);
      leaveWorkspaceSocket(workspace.id);
    };
  }, [id, workspace]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a chat message as client
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      const savedMessage = await sendMessageAsClient(id, messageText);

      if (savedMessage) {
        // Broadcast via socket with full message (including ID)
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
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  // Process payment and update backend
  const processPayment = async (paymentMethod: string) => {
    if (!selectedInvoice || !id) return;

    setPaymentProcessing(true);
    try {
      // Call backend to mark invoice as paid
      const response = await fetch(
        `${API_URL}/api/client/${id}/invoices/${selectedInvoice.id}/pay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      // Update local state
      if (workspace) {
        setWorkspace({
          ...workspace,
          invoices: workspace.invoices.map(inv =>
            inv.id === selectedInvoice.id ? { ...inv, status: "paid" } : inv
          ),
        });
      }

      toast.success(`Payment successful via ${paymentMethod}!`);

      // Emit socket notification to freelancer
      if (workspace) {
        emitInvoicePaid({
          workspaceId: id,
          amount: selectedInvoice.amount,
          workspaceName: workspace.name
        });
      }

      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto w-full px-4 py-10">
            <h1 className="text-2xl font-bold">Shared Workspace</h1>
            <p className="text-sm mt-2 opacity-80">Loading...</p>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto w-full px-4 py-10">
            <h1 className="text-2xl font-bold">Shared Workspace</h1>
          </div>
        </header>
        <main className="flex-1 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <Share2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Unable to Load Workspace</h2>
              <p className="text-gray-500">{error || "Something went wrong"}</p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{workspace.name}</h1>
                {workspace.description && (
                  <p className="text-sm mt-1 opacity-80">{workspace.description}</p>
                )}
                <p className="text-xs mt-2 text-gray-500">
                  Shared by {workspace.freelancerName}
                </p>
              </div>
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/70 hover:bg-white"
                  >
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {clientNotifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                          {clientNotifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setClientNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Mark all as read
                      </Button>
                      <Button
                        onClick={() => setClientNotifications([])}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                    {clientNotifications.length > 0 ? (
                      clientNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            setClientNotifications(prev =>
                              prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                            );
                            setActiveTab("chat");
                            setIsNotificationOpen(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                              )}
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                            </div>
                            <span className="text-xs opacity-80">
                              {new Date(notification.timestamp).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs opacity-70 mt-1">{notification.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </FadeIn>
        </div>
      </header>

      {/* Tabs Navigation */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-xl mb-6">
              <TabsTrigger value="files" className="flex gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Files</span>
                {workspace.files.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {workspace.files.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
                {workspace.messages.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {workspace.messages.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="todos" className="flex gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
                {workspace.todos.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {workspace.todos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Invoices</span>
                {workspace.invoices.filter(inv => inv.status?.toLowerCase() !== 'draft').length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {workspace.invoices.filter(inv => inv.status?.toLowerCase() !== 'draft').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Files Tab */}
            <TabsContent value="files">
              <FadeIn>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Shared Files</CardTitle>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="rounded-full"
                      >
                        {uploadingFile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Upload File
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workspace.files.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No files shared yet</p>
                        <p className="text-sm mt-2">Upload files to share with the freelancer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workspace.files.map((file) => (
                          <div
                            key={file.id}
                            className="rounded-xl border border-gray-100 overflow-hidden transition-all"
                          >
                            {/* File Header */}
                            <div className="flex items-center justify-between p-4 hover:bg-primary/5 group">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{file.filename}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)} • {formatDate(file.createdAt)}
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
                                {/* Only show delete button if uploaded by client */}
                                {file.uploadedBy === 'client' && (
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
                                        className={`flex ${comment.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[80%] rounded-xl px-3 py-2 ${comment.sender === 'client'
                                            ? 'bg-primary text-white'
                                            : 'bg-white border border-gray-200'
                                            }`}
                                        >
                                          <p className="text-sm">{comment.text}</p>
                                          <p className={`text-xs mt-1 ${comment.sender === 'client' ? 'text-white/70' : 'text-gray-400'}`}>
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
                                        handleAddFileComment(file.id);
                                      }
                                    }}
                                    className="flex-1 rounded-full text-sm"
                                  />
                                  <Button
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => handleAddFileComment(file.id)}
                                    disabled={!newFileComment.trim()}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <FadeIn>
                <Card className="h-[calc(100vh-300px)] min-h-[400px] max-h-[600px] flex flex-col overflow-hidden">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start a conversation with the freelancer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.sender === "client"
                                  ? "bg-primary text-white rounded-br-sm"
                                  : "bg-white border border-gray-200 rounded-bl-sm"
                                  }`}
                              >
                                <p className="text-sm break-all">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === "client" ? "text-white/70" : "text-gray-400"}`}>
                                  {formatTime(message.createdAt)}
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
                          if (e.key === "Enter" && !e.shiftKey) {
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
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </TabsContent>

            {/* Todos/Tasks Tab */}
            <TabsContent value="todos">
              <FadeIn>
                <Card>
                  <CardHeader>
                    <CardTitle>Project Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workspace.todos.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workspace.todos.map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <CheckSquare className={`h-5 w-5 ${todo.status === "done" ? "text-green-500" : "text-gray-400"
                                }`} />
                              <span className={todo.status === "done" ? "line-through text-gray-400" : ""}>
                                {todo.title}
                              </span>
                            </div>
                            <Badge variant={
                              todo.status === "done" ? "outline" :
                                todo.status === "in-progress" ? "secondary" : "outline"
                            } className={
                              todo.status === "done" ? "bg-green-50 text-green-700 border-green-200" :
                                todo.status === "in-progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-gray-50 text-gray-600"
                            }>
                              {todo.status === "in-progress" ? "In Progress" :
                                todo.status === "done" ? "Done" : "To Do"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <FadeIn>
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workspace.invoices.filter(inv => inv.status?.toLowerCase() !== 'draft').length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No invoices yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {workspace.invoices
                          .filter(inv => inv.status?.toLowerCase() !== 'draft')
                          .map((invoice) => (
                          <div
                            key={invoice.id}
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsPaymentModalOpen(true);
                            }}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Receipt className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {invoice.invoiceNumber || `Invoice INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Due {formatDate(invoice.dueDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg">${((invoice.amount || 0) * (1 + (invoice.taxPercentage || 0) / 100)).toFixed(2)}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    invoice.status === "paid"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : invoice.status === "sent"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                  }
                                >
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </div>
                              {invoice.status !== "paid" && (
                                <Button variant="default" size="sm" className="rounded-full">
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            </TabsContent>

            {/* Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogContent className="max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Pay Invoice</DialogTitle>
                  <DialogDescription>
                    Complete payment for this invoice
                  </DialogDescription>
                </DialogHeader>

                {selectedInvoice && (
                  <div className="space-y-6">
                    {/* Invoice Summary */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Invoice</span>
                        <span className="font-medium">{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id.slice(0, 8).toUpperCase()}`}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Amount Due</span>
                        <span className="text-2xl font-bold text-primary">${((selectedInvoice.amount || 0) * (1 + (selectedInvoice.taxPercentage || 0) / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Due Date</span>
                        <span className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selectedInvoice.dueDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge
                          variant="outline"
                          className={
                            selectedInvoice.status === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {selectedInvoice.status === "paid" ? (
                      <div className="text-center py-6">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-3" />
                        <p className="text-lg font-semibold text-green-700">Payment Complete!</p>
                        <p className="text-sm text-gray-500 mt-1">This invoice has been paid</p>
                      </div>
                    ) : (
                      <>
                        {/* Payment Methods */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Payment Method</p>

                          {/* PayPal Button - Redirect to PayPal.Me if URL available */}
                          <Button
                            className="w-full h-12 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white"
                            disabled={paymentProcessing}
                            onClick={() => {
                              if (selectedInvoice.paymentUrl) {
                                // Redirect to PayPal.Me URL
                                window.open(selectedInvoice.paymentUrl, '_blank');
                                toast('Redirecting to PayPal... Complete payment on PayPal, then come back and let the freelancer know.');
                              } else {
                                // Fallback to old payment flow
                                processPayment('PayPal');
                              }
                            }}
                          >
                            {paymentProcessing ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .762-.654h6.373c2.898 0 4.946 1.972 4.607 4.834-.28 2.364-2.267 4.097-4.71 4.097H8.58l-.914 5.34-.59 4zm12.41-14.498c.03-.375.047-.754.047-1.135 0-3.03-2.203-4.624-5.87-4.624H7.44a1.29 1.29 0 0 0-1.273 1.09L3.053 20.86a.855.855 0 0 0 .844.987h4.607l-.59 3.44a.757.757 0 0 0 .747.873h3.683c.454 0 .84-.328.91-.773l.037-.202.717-4.543.046-.255a.918.918 0 0 1 .907-.773h.57c3.688 0 6.573-1.498 7.414-5.834.352-1.814.171-3.325-.762-4.39-.282-.323-.64-.604-1.058-.84z" />
                                </svg>
                                Pay with PayPal
                              </>
                            )}
                          </Button>

                          {/* Card Payment Button */}
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl"
                            disabled={paymentProcessing}
                            onClick={() => processPayment('Card')}
                          >
                            {paymentProcessing ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pay with Card
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-xs text-center text-gray-400">
                          Secure payment processing. Your payment information is encrypted.
                        </p>
                      </>
                    )}
                  </div>
                )}
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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SharedWorkspaceView;
