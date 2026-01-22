
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPayPalCredentials, storePayPalCredentials } from "@/services/paypalService";

interface PayPalCredentialsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (clientId: string) => void; // Remove client secret from here
}

const PayPalCredentialsForm: React.FC<PayPalCredentialsFormProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Load saved credentials if they exist
  useEffect(() => {
    if (open) {
      const savedCredentials = getPayPalCredentials();
      if (savedCredentials) {
        setClientId(savedCredentials.clientId);
      }
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!clientId.trim()) {
      setError("Client ID is required");
      return;
    }
    
    setLoading(true);
    
    // Store only client ID
    try {
      const saved = storePayPalCredentials(clientId);
      
      if (saved) {
        toast({
          title: "PayPal Credentials Saved",
          description: "Your PayPal Client ID has been saved locally for this session",
        });
        
        onSubmit(clientId);
        onOpenChange(false);
      } else {
        setError("Failed to save PayPal credentials");
      }
    } catch (error) {
      console.error("Error saving PayPal credentials:", error);
      setError("Failed to save PayPal credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Enter PayPal Client ID
          </DialogTitle>
          <DialogDescription>
            Enter the Client ID from your PayPal Developer Dashboard. 
            These credentials will be stored locally in your browser for this session only.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="clientId">PayPal Client ID <span className="text-red-500">*</span></Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter your client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Find this in PayPal Developer Dashboard under My Apps & Credentials → REST API apps
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Client ID"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalCredentialsForm;
