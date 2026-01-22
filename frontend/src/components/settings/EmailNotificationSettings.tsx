
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEmailNotifications } from "@/hooks/use-email-notifications";

interface EmailNotificationSettingsProps {
  className?: string;
}

const EmailNotificationSettings: React.FC<EmailNotificationSettingsProps> = ({ className }) => {
  const { user } = useAuth();
  const [newMessages, setNewMessages] = useState(true);
  const [newInvoices, setNewInvoices] = useState(true);
  const [fileUploads, setFileUploads] = useState(false);
  const { sendNotificationEmail, sending } = useEmailNotifications();
  
  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast.error("No email address found for your account");
      return;
    }
    
    const success = await sendNotificationEmail(
      user.email,
      "Test Workspace",
      "new-message",
      { messagePreview: "This is a test notification email from GigFlow." }
    );
    
    if (success) {
      toast.success("Test notification email sent successfully");
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure when you receive email notifications from GigFlow
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">New Messages</label>
            <p className="text-xs text-muted-foreground">
              Receive an email when clients send new messages
            </p>
          </div>
          <Switch 
            checked={newMessages} 
            onCheckedChange={setNewMessages} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">New Invoices</label>
            <p className="text-xs text-muted-foreground">
              Receive an email when new invoices are created
            </p>
          </div>
          <Switch 
            checked={newInvoices} 
            onCheckedChange={setNewInvoices} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">File Uploads</label>
            <p className="text-xs text-muted-foreground">
              Receive an email when files are uploaded to workspaces
            </p>
          </div>
          <Switch 
            checked={fileUploads} 
            onCheckedChange={setFileUploads} 
          />
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Button
          onClick={handleSendTestEmail}
          disabled={sending || !user?.email}
          variant="outline"
          size="sm"
        >
          {sending ? "Sending..." : "Send Test Email"}
        </Button>
        {!user?.email && (
          <p className="text-xs text-red-500 mt-2">
            You need to add an email to your account first
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailNotificationSettings;
