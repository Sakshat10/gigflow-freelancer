
interface PayPalSubscription {
  create: (options: { 
    plan_id: string;
    application_context?: {
      shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
      user_action?: 'CONTINUE' | 'SUBSCRIBE_NOW';
      payment_method_preference?: 'IMMEDIATE_PAYMENT_REQUIRED' | 'UNRESTRICTED';
    }
  }) => Promise<any>;
}

interface PayPalActions {
  subscription: PayPalSubscription;
  order: {
    create: (data: any) => Promise<string>;
    capture: () => Promise<any>;
  };
}

interface PayPalButtonsConstructor {
  render: (element: string | HTMLElement) => void;
}

interface PayPalButtons {
  Buttons: (options: {
    style?: {
      shape?: 'rect' | 'pill';
      color?: 'gold' | 'blue' | 'silver' | 'black' | 'white';
      layout?: 'vertical' | 'horizontal';
      label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
      height?: number;
    };
    createOrder?: (data: any, actions: PayPalActions) => Promise<string>;
    createSubscription?: (data: any, actions: PayPalActions) => Promise<any>;
    onApprove?: (data: any, actions?: any) => void;
    onCancel?: (data: any) => void;
    onError?: (err: any) => void;
  }) => PayPalButtonsConstructor;
}

interface Window {
  paypal: PayPalButtons;
  confetti?: (options: any) => void;
}
