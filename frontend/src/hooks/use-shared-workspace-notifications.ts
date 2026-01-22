
import { useEffect, useRef, useState } from 'react';
import { Message, Invoice } from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEmailNotifications } from '@/hooks/use-email-notifications';
import { realtimeService } from '@/services/realtimeService';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useSharedWorkspaceNotifications = (
  shareId: string | undefined,
  workspaceName: string | undefined,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  files: any[],
  setFiles: React.Dispatch<React.SetStateAction<any[]>>,
  invoices: Invoice[],
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>
) => {
  const { addNotification } = useNotifications();
  const { sendNotificationEmail } = useEmailNotifications();
  const messagesRef = useRef<Message[]>([]);
  const filesRef = useRef<any[]>([]);
  const invoicesRef = useRef<Invoice[]>([]);
  const channelIdRef = useRef<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  
  useEffect(() => {
    invoicesRef.current = invoices;
  }, [invoices]);
  
  useEffect(() => {
    if (!shareId) return;
    
    const channelId = `shared_workspace_${shareId}`;
    channelIdRef.current = channelId;
    
    realtimeService.subscribe(channelId, [
      {
        table: 'messages',
        event: 'INSERT',
        filter: 'workspace_id',
        filterValue: shareId,
        callback: async (payload) => {
          const newMessage = payload.new;
          
          const formattedMessage: Message = {
            id: newMessage.id,
            sender: newMessage.sender as "me" | "client",
            content: newMessage.content,
            timestamp: new Date(newMessage.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            hasAttachment: newMessage.has_attachment,
            attachmentType: newMessage.attachment_type,
            attachmentUrl: newMessage.attachment_url,
            attachmentName: newMessage.attachment_name
          };
          
          const isDuplicate = messagesRef.current.some(msg => 
            msg.id === formattedMessage.id || 
            (msg.content === formattedMessage.content && 
             Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 5000)
          );
          
          if (!isDuplicate) {
            setMessages(prevMessages => {
              if (!prevMessages.some(msg => msg.id === formattedMessage.id)) {
                return [...prevMessages, formattedMessage];
              }
              return prevMessages;
            });
            
            if (formattedMessage.sender === 'me') {
              addNotification({
                title: 'New Message',
                description: formattedMessage.content.substring(0, 50) + (formattedMessage.content.length > 50 ? '...' : ''),
                link: `/share/${shareId}?tab=chat`,
                hasAttachment: formattedMessage.hasAttachment,
                attachmentType: formattedMessage.attachmentType || undefined
              });
            }
          } else {
            logger.info("Duplicate message detected, ignoring:", formattedMessage);
          }
        }
      },
      
      {
        table: 'files',
        event: 'INSERT',
        filter: 'workspace_id',
        filterValue: shareId,
        callback: async (payload) => {
          const fileData = payload.new;
          
          const formattedFile = {
            id: fileData.id,
            name: fileData.name,
            type: fileData.type,
            size: fileData.size,
            url: fileData.url,
            createdAt: new Date(fileData.created_at).toLocaleDateString()
          };
          
          const isDuplicate = filesRef.current.some(file => file.id === formattedFile.id);
          
          if (!isDuplicate) {
            setFiles(prevFiles => [formattedFile, ...prevFiles]);
            
            addNotification({
              title: 'New File Uploaded',
              description: `${formattedFile.name} has been added to the workspace`,
              link: `/share/${shareId}?tab=files`
            });
          }
        }
      },
      
      {
        table: 'invoices',
        event: 'INSERT',
        filter: 'workspace_id',
        filterValue: shareId,
        callback: async (payload) => {
          const newInvoice = payload.new;
          
          const formattedInvoice: Invoice = {
            id: newInvoice.id,
            amount: newInvoice.amount,
            clientName: workspaceName || "Client", 
            date: newInvoice.date,
            description: newInvoice.description,
            dueDate: newInvoice.due_date,
            status: (newInvoice.status as "Paid" | "Pending" | "Overdue"),
            taxPercentage: newInvoice.tax_percentage,
            workspaceId: newInvoice.workspace_id,
            createdAt: newInvoice.created_at
          };
          
          const isDuplicate = invoicesRef.current.some(invoice => invoice.id === formattedInvoice.id);
          
          if (!isDuplicate) {
            setInvoices(prevInvoices => [formattedInvoice, ...prevInvoices]);
            
            addNotification({
              title: 'New Invoice Created',
              description: 'A new invoice has been generated for you to review',
              link: `/share/${shareId}?tab=invoices`
            });
          }
        }
      },
      
      {
        table: 'files',
        event: 'UPDATE',
        filter: 'workspace_id',
        filterValue: shareId,
        callback: (payload) => {
          setFiles(prevFiles => 
            prevFiles.map(file => file.id === payload.new.id ? {
              ...file,
              name: payload.new.name,
              type: payload.new.type,
              size: payload.new.size,
              url: payload.new.url,
            } : file)
          );
        }
      },
      {
        table: 'invoices',
        event: 'UPDATE',
        filter: 'workspace_id',
        filterValue: shareId,
        callback: (payload) => {
          setInvoices(prevInvoices => 
            prevInvoices.map(invoice => invoice.id === payload.new.id ? {
              ...invoice,
              amount: payload.new.amount,
              description: payload.new.description,
              dueDate: payload.new.due_date,
              status: payload.new.status,
              taxPercentage: payload.new.tax_percentage,
            } : invoice)
          );
        }
      }
    ]).catch(error => {
      logger.error("Error setting up shared workspace realtime:", error);
      setRealtimeError("Failed to set up real-time updates. Some data may not refresh automatically.");
      toast.error("Failed to set up real-time updates. Some data may not refresh automatically.");
    });
      
    logger.info("Shared view subscription channels created");
      
    return () => {
      logger.info("Cleaning up shared view real-time subscriptions");
      if (channelIdRef.current) {
        realtimeService.unsubscribe(channelIdRef.current);
      }
    };
  }, [shareId, addNotification, sendNotificationEmail, workspaceName, setMessages, setFiles, setInvoices]);

  return { messagesRef, filesRef, invoicesRef };
};
