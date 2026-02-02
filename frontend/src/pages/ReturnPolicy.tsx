
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

const ReturnPolicy: React.FC = () => {
  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-3xl font-bold mb-8">Subscription & Refund Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">About Our Service</h2>
              <p>
                GigFlow is a software-as-a-service (SaaS) platform that helps freelancers manage their client 
                relationships. When you subscribe to GigFlow, you gain access to our platform and features based 
                on your chosen plan.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Subscription Plans</h2>
              <p>
                GigFlow offers recurring subscription plans:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Free Plan - No payment required</li>
                <li>Pro Plan - Monthly recurring subscription</li>
                <li>Pro Plus Plan - Monthly recurring subscription</li>
              </ul>
              <p>
                Paid subscriptions automatically renew at the end of each billing period unless you cancel. 
                You will be charged the subscription fee at the start of each billing cycle.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Payment Processing</h2>
              <p>
                All payments are processed securely through third-party payment providers such as PayPal. 
                By subscribing to a paid plan, you authorize us to charge your payment method for the 
                applicable subscription fees.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Refund Policy</h2>
              <p>
                Subscription fees are generally non-refundable. Once you have been charged for a billing period, 
                that payment will not be refunded, except where required by applicable law.
              </p>
              <p className="mt-4">
                If you believe you have been charged in error, please contact us at support@gigflow.com within 
                7 days of the charge, and we will review your case.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Cancellation</h2>
              <p>
                You can cancel your subscription at any time through your account settings. Here's what happens 
                when you cancel:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Your subscription will not renew at the end of the current billing period</li>
                <li>You will continue to have access to paid features until the end of your current billing period</li>
                <li>No refund will be provided for the remaining days in your current billing period</li>
                <li>After your subscription ends, your account will revert to the Free plan</li>
              </ul>
              <p>
                To cancel your subscription, go to Settings → Pricing and manage your subscription through your 
                payment provider.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Access to Your Data</h2>
              <p>
                If you cancel your subscription or your account becomes inactive:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>You can continue to access your data while on the Free plan</li>
                <li>Some features may be limited based on Free plan restrictions</li>
                <li>You can export your data at any time while you have access to your account</li>
              </ul>
              <p>
                If you delete your account, your data will be removed in accordance with our Privacy Policy.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Plan Changes</h2>
              <p>
                You can upgrade or downgrade your plan at any time:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Upgrades take effect immediately, and you will be charged the difference for the current billing period</li>
                <li>Downgrades take effect at the end of your current billing period</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Price Changes</h2>
              <p>
                We may change our subscription prices from time to time. If we increase the price of your plan, 
                we will notify you in advance. The new price will apply to your next billing cycle after the 
                notice period. You can cancel your subscription before the new price takes effect if you do not 
                agree to the price change.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about subscriptions, billing, or refunds, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:support@gigflow.com" className="text-blue-600 hover:underline">support@gigflow.com</a>
              </p>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
