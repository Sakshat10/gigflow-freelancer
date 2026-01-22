
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import PayPalCredentialsForm from "./PayPalCredentialsForm";

interface PayPalCredentialsButtonProps {
  onCredentialsSet?: (clientId: string) => void; // Remove client secret
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const PayPalCredentialsButton: React.FC<PayPalCredentialsButtonProps> = ({ 
  onCredentialsSet,
  variant = "outline",
  size = "default"
}) => {
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(!!localStorage.getItem('PAYPAL_CLIENT_ID'));

  const handleSubmit = (clientId: string) => {
    setHasCredentials(true);
    if (onCredentialsSet) {
      onCredentialsSet(clientId); // Remove client secret
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowCredentialsForm(true)}
        className="gap-2"
      >
        <KeyRound className="h-4 w-4" />
        {hasCredentials ? "Update PayPal Client ID" : "Set PayPal Client ID"}
      </Button>

      <PayPalCredentialsForm
        open={showCredentialsForm}
        onOpenChange={setShowCredentialsForm}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default PayPalCredentialsButton;
