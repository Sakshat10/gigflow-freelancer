
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";

const SupportSettings: React.FC = () => {
  return (
    <FadeIn delay="100" className="w-full">
      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
          <p className="text-gray-600 mb-6">
            Get help with using GigFlow or contact our support team.
          </p>
          
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-2">Need help?</h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <Button className="rounded-full hover-translate">
                Contact Support
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How do I create and manage client workspaces?</h4>
                  <p className="text-gray-600 text-sm">
                    You can create new workspaces from your dashboard by clicking the "New Workspace" button. Each workspace provides dedicated spaces for client communication, file sharing, and project management.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">What features are included in different plans?</h4>
                  <p className="text-gray-600 text-sm">
                    The Free plan includes chat, file sharing, and task management with 1 workspace. Pro adds invoicing and document generation with 5 workspaces. Pro Plus offers unlimited workspaces plus email blaster and advanced client management features.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How does the client chat work?</h4>
                  <p className="text-gray-600 text-sm">
                    Each workspace includes a dedicated chat area where you can communicate with your clients in real-time. Clients can access the chat through their shared workspace view without needing to create an account.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How do I create and send invoices?</h4>
                  <p className="text-gray-600 text-sm">
                    Pro and Pro Plus users can create professional invoices directly from workspaces or the Invoices section. Add your business details, customize the template, include line items, and send them to clients with integrated payment options.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How do I share files with clients?</h4>
                  <p className="text-gray-600 text-sm">
                    You can upload and share files directly in each workspace. Clients can access shared files through their workspace view and download them. The storage limit varies by plan: 500MB for Free, 5GB for Pro, and 10GB for Pro Plus.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">What payment methods are supported for invoices?</h4>
                  <p className="text-gray-600 text-sm">
                    We support PayPal integration for receiving client payments. You can set up your PayPal business account in the Payment Settings and start accepting payments through your invoices immediately.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Can I customize invoice templates?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes, Pro and Pro Plus users can customize their invoice templates with their company logo, brand colors, and preferred layout. You can manage these settings in the Invoice Settings section.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How do I manage task lists for projects?</h4>
                  <p className="text-gray-600 text-sm">
                    Each workspace includes a Things section where you can create and manage task lists. You can organize tasks, set priorities, and share progress with clients through their workspace view.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How does the email blaster feature work?</h4>
                  <p className="text-gray-600 text-sm">
                    Pro Plus users can send bulk emails to their clients using the Email Blaster feature. Create personalized email campaigns, select recipients from your client list, and track engagement all from one place.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Are contracts and documents generated on GigFlow legally binding?</h4>
                  <p className="text-gray-600 text-sm">
                    Documents generated on GigFlow are AI-assisted drafts created for reference purposes only. They are not a substitute for legal advice. Users should review all documents carefully and consult a qualified legal professional before signing or sharing them.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">How does AI help with document creation?</h4>
                  <p className="text-gray-600 text-sm">
                    GigFlow uses AI to help structure documents and improve clarity based on the details you provide. The AI assists with formatting and language, but you remain responsible for reviewing and approving the final content.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Can I edit the document after it's generated?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes. All generated documents can be reviewed, copied, downloaded, or regenerated. You should always ensure the document accurately reflects your agreement before using it.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Which document types can I generate on GigFlow?</h4>
                  <p className="text-gray-600 text-sm">
                    You can generate the following AI-assisted documents: Service Agreements (Contracts), Non-Disclosure Agreements (NDAs), Statements of Work (SOWs), and Project Proposals. Availability may vary by plan.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Does GigFlow sign or send documents automatically?</h4>
                  <p className="text-gray-600 text-sm">
                    No. GigFlow does not automatically sign, send, or enforce documents. All documents remain drafts until you choose how to use or share them.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Is my data used to train the AI?</h4>
                  <p className="text-gray-600 text-sm">
                    No. Your document content and client details are not used to train AI models. Your data is used only to generate documents for your account.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Should I use GigFlow documents for important legal agreements?</h4>
                  <p className="text-gray-600 text-sm">
                    GigFlow documents are best used as starting drafts. For important or high-value agreements, we strongly recommend consulting a legal professional before finalizing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default SupportSettings;

