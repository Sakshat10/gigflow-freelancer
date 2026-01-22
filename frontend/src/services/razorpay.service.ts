
// This file now re-exports from the subscription/razorpay.service.ts file
// to avoid duplicate implementations and potential bugs

import { 
  createRazorpaySubscription, 
  getRazorpaySubscriptionDetails, 
  cancelRazorpaySubscription,
  upgradeRazorpaySubscription 
} from './subscription/razorpay.service';

export { 
  createRazorpaySubscription, 
  getRazorpaySubscriptionDetails, 
  cancelRazorpaySubscription,
  upgradeRazorpaySubscription 
};
