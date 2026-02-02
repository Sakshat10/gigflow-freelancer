
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
                GigFlow ("we", "our", "us") is a platform designed to help freelancers manage their client relationships. 
                This Privacy Policy explains how we collect, use, and protect your information when you use our platform. 
                Please read this policy carefully. If you do not agree with these terms, please do not use our platform.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you register for an account, create or 
                modify your profile, set preferences, or use the platform. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Personal identifiers (name, email address)</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Business information</li>
                <li>Content you upload to the platform (files, messages, invoices)</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Payment Information</h2>
              <p>
                All payment transactions are processed by third-party payment providers, such as PayPal. 
                GigFlow does not store or process your credit card details or other sensitive payment information. 
                When you make a payment, you are redirected to the payment provider's secure platform. 
                Please review the payment provider's privacy policy for information on how they handle your data.
              </p>
              
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
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to improve your experience on our platform. 
                Cookies help us with:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Session management (keeping you logged in)</li>
                <li>Performance and usability improvements</li>
                <li>Usage analytics to understand how you use our platform</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to refuse cookies 
                or delete existing cookies. Please note that disabling cookies may affect your ability to use 
                certain features of our platform.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share your information in 
                the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>With service providers who help us operate our platform (hosting, analytics, customer support)</li>
                <li>When required by law or to respond to legal requests</li>
                <li>To protect the rights, property, or safety of GigFlow, our users, or others</li>
                <li>In connection with a business transaction (merger, acquisition, or sale of assets)</li>
                <li>With your consent or at your direction</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
              <p>
                We implement reasonable technical and organizational measures to protect your personal information. 
                However, no method of transmission over the Internet or electronic storage is completely secure. 
                While we strive to protect your data, we cannot guarantee absolute security.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Children's Privacy</h2>
              <p>
                Our platform is not intended for users under the age of 18. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child under 18, 
                please contact us at privacy@gigflow.com and we will take steps to delete such information.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p>
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>The right to access personal information we hold about you</li>
                <li>The right to request correction or deletion of your personal information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at privacy@gigflow.com. 
                We will respond to your request within a reasonable timeframe.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for 
                other operational, legal, or regulatory reasons. We will notify you of any material changes by 
                posting the updated policy on this page and updating the "Last Updated" date. We encourage you 
                to review this policy periodically.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or how we handle your information, 
                please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:privacy@gigflow.com" className="text-blue-600 hover:underline">privacy@gigflow.com</a>
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
