
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/animations/FadeIn";
import EmailNotificationSettings from "@/components/settings/EmailNotificationSettings";

const NotificationSettings: React.FC = () => {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive notifications.
          </p>
        </div>
        <Separator />
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="app">In-App</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <EmailNotificationSettings />
          </TabsContent>
          
          <TabsContent value="app" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">In-App Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your in-app notification preferences
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                In-app notifications are currently enabled for all activities.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  );
};

export default NotificationSettings;
