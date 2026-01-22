
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Introduction</h2>
              <p>
                At GigFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our platform. Please read this privacy policy carefully. 
                If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you register for an account, create or 
                modify your profile, set preferences, or make purchases through the platform. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Personal identifiers (name, email address, phone number)</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Payment and billing information</li>
                <li>Business information</li>
                <li>Content you upload to the platform</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative messages, updates, and security alerts</li>
                <li>Respond to your comments and questions</li>
                <li>Provide customer support</li>
                <li>Monitor and analyze usage trends</li>
                <li>Personalize your experience</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties 
                except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>With vendors and service providers who need access to such information to carry out work on our behalf</li>
                <li>In response to a request for information if we believe disclosure is in accordance with applicable law</li>
                <li>If we believe your actions are inconsistent with our user agreements or policies</li>
                <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition</li>
                <li>With your consent or at your direction</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal 
                information. However, please be aware that no method of transmission over the Internet or method of 
                electronic storage is 100% secure.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>The right to access personal information we hold about you</li>
                <li>The right to request correction or deletion of your personal information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our Privacy Policy, please contact our support team at 
                <a href="mailto:privacy@gigflow.com" className="text-blue-600 hover:underline ml-1">privacy@gigflow.com</a>.
              </p>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
