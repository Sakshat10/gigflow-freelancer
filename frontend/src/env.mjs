
export const env = {
  // PayPal configuration
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
  PAYPAL_API_URL: 'https://api-m.sandbox.paypal.com',
  
  // App URLs
  NEXT_PUBLIC_APP_URL: import.meta.env.VITE_APP_URL || window.location.origin,
  
  // Razorpay configuration
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || '',
};
