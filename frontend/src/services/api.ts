
import { formatRelativeTime } from "./utils/dateUtils";
import { fetchUser } from "./userService";
import { fetchInvoices } from "./invoiceService";
import { fetchMessages, sendMessage } from "./messageService";
import { uploadFile, fetchFiles, uploadFileAsClient, fetchFilesAsClient, getFileDownloadUrl } from "./fileService";
import { fetchConversations } from "./conversationService";
import { fetchPricingPlans, fetchFeatures, fetchBentoCardData } from "./marketingService";
import { recordPayment, updateInvoicePaymentStatus } from "./paymentService";
import { fetchClients, addClient, updateClientStatus, deleteClient } from "./clientService";
import * as invoiceService from "./invoiceService";
import { 
  fetchWorkspace,
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace 
} from "./workspace";

// Re-export everything for backward compatibility
export {
  formatRelativeTime,
  fetchUser,
  fetchWorkspaces,
  fetchWorkspace,
  createWorkspace,
  deleteWorkspace,
  fetchInvoices,
  fetchMessages,
  sendMessage,
  uploadFile,
  fetchFiles,
  uploadFileAsClient,
  fetchFilesAsClient,
  getFileDownloadUrl,
  fetchConversations,
  fetchPricingPlans,
  fetchFeatures,
  fetchBentoCardData,
  recordPayment,
  updateInvoicePaymentStatus,
  fetchClients,
  addClient,
  updateClientStatus,
  deleteClient
};

// Create a new invoice
export const createInvoice = async (
  workspaceId: string, 
  amount: number, 
  dueDate: string, 
  description?: string,
  taxPercentage?: number
): Promise<any> => {
  try {
    // We need to directly call our invoiceService here
    const result = await invoiceService.createInvoice(
      workspaceId,
      amount,
      dueDate,
      description,
      taxPercentage
    );
    
    return result;
  } catch (error) {
    throw error;
  }
};
