export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "pro_plus";
  memberSince?: string;
  company?: string;
  storageUsed?: number;
  storageLimit?: number;
  paypalMeUsername?: string;
  createdAt?: string;
  emailVerified?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  fileCount: number;
  messageCount: number;
  lastActivity: string;
  hasNewMessages?: boolean;
  clientEmail?: string;
  clientName?: string;
  shareToken?: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
  date: string;
  dueDate: string;
  description?: string;
  taxPercentage?: number;
  workspaceId?: string;
  createdAt?: string;
  paypalEmail?: string | null;
  invoiceNumber?: string;
  paymentUrl?: string;
  currency?: string;
}

export interface Message {
  id: string;
  sender: "me" | "client";
  content: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string | null;
}

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  originalPrice?: number;
  monthlyPrice?: number;
  [priceKey: string]: any;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export interface BentoCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  colors: string[];
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export interface FileComment {
  id: string;
  fileId: string;
  sender: "me" | "client";
  content: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  status: "active" | "previous" | "potential";
  created_at: string;
  user_id?: string;
}

export interface Thing {
  id: string;
  title: string;
  completed: boolean;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
  dueDate: string;
  priority: "high" | "medium" | "low" | string;
  category: string;
  notes: string;
  workspaceId: string;
}

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  plan?: string;
  company?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
  provider?: string;
  paypal?: {
    approvalUrl?: string;
    subscriptionId?: string;
  };
  razorpay?: {
    key: string;
    amount: number;
    currency: string;
  };
}
