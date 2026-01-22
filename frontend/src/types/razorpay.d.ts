
interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
    ondismiss?: () => void;
    handleBack?: () => void;
  };
  subscription_card_change?: boolean;
  callback_url?: string;
  handler?: (response: any) => void;
  readonly?: boolean;
  send_sms_hash?: boolean;
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  config?: {
    display?: {
      language?: string;
      hide_topbar?: boolean;
      blocks?: {
        [key: string]: {
          name?: string;
          instruments?: string[];
        };
      };
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, callback: Function) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
  Razorpay: RazorpayConstructor;
  confetti?: any;
}

declare const Razorpay: RazorpayConstructor;
