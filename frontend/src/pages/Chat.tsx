import React from "react";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Chat: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <FadeIn>
          <Card className="p-8 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chat Feature</h2>
            <p className="text-gray-500">
              Real-time chat functionality will be available once the backend is connected.
            </p>
          </Card>
        </FadeIn>
      </main>
    </div>
  );
};

export default Chat;
