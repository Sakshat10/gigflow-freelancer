import React from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

const ClientEmails: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Email Management</h1>
          <p className="text-muted-foreground">
            Manage your clients and send them personalized emails
          </p>
        </div>

        <Card className="p-8 text-center">
          <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Email Feature</h2>
          <p className="text-gray-500">
            Client email management will be available once the backend is connected.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ClientEmails;