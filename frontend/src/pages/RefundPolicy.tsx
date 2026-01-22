
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

const RefundPolicy: React.FC = () => {
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
            <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Our Refund Policy</h2>
              <p>
                We want you to be completely satisfied with your subscription to GigFlow. If you're not happy with our 
                service for any reason, we offer a refund policy that is designed to be fair and transparent.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Subscription Refunds</h2>
              <p>
                For monthly subscription plans, we offer a money-back guarantee from the date of your initial 
                purchase. If you are not satisfied with our services, you can request a full refund 
                of your subscription fee.
              </p>
              <p>
                For annual subscription plans, we extend the refund period to 30 days from the date of purchase, 
                providing you with additional time to evaluate our platform thoroughly.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">How to Request a Refund</h2>
              <p>
                To request a refund, please contact our support team at 
                <a href="mailto:support@gigflow.com" className="text-blue-600 hover:underline ml-1">support@gigflow.com</a> 
                with your account details and reason for requesting a refund. Our team will process your request promptly.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Exceptions</h2>
              <p>
                Please note that the following cases are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Requests made after the refund period has expired</li>
                <li>Accounts that have violated our Terms of Service</li>
                <li>Subscription renewals (refunds apply only to initial purchases)</li>
                <li>Any additional services or add-ons purchased separately</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Processing Time</h2>
              <p>
                Refunds are typically processed within 5-7 business days, depending on your payment method and financial 
                institution. Once processed, it may take an additional few days for the refund to appear in your account.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our Refund Policy, please contact our support team at 
                <a href="mailto:support@gigflow.com" className="text-blue-600 hover:underline ml-1">support@gigflow.com</a>.
              </p>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RefundPolicy;
