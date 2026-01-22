
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
            <h1 className="text-3xl font-bold mb-8">Return Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Digital Services</h2>
              <p>
                As GigFlow is a software-as-a-service (SaaS) platform providing digital services, traditional return 
                policies that apply to physical goods do not apply. Instead, we offer a comprehensive refund policy for 
                our subscription services.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Subscription Services</h2>
              <p>
                For information regarding cancellations and refunds for our subscription services, please refer to our 
                <a href="/refund-policy" className="text-blue-600 hover:underline mx-1">Refund Policy</a> 
                which outlines the conditions and processes for receiving refunds on subscription fees.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Downloadable Content</h2>
              <p>
                Any downloadable content, templates, or digital assets provided as part of our service are subject to 
                our licensing terms. Once these digital items have been downloaded, they cannot be "returned." However, 
                if you encounter issues with any downloadable content, our support team is available to assist you.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Data Extraction</h2>
              <p>
                If you cancel your subscription to GigFlow, we provide a 30-day window for you to extract your data 
                from our platform. After this period, your data may be deleted in accordance with our 
                <a href="/privacy-policy" className="text-blue-600 hover:underline mx-1">Privacy Policy</a>.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Custom Services</h2>
              <p>
                For any custom development or consulting services provided outside our standard subscription offerings, 
                return and refund terms will be specified in the individual service agreement.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our Return Policy, please contact our support team at 
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

export default ReturnPolicy;
