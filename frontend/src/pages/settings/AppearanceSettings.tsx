
import React from "react";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/FadeIn";

const AppearanceSettings: React.FC = () => {
  return (
    <FadeIn delay="100" className="w-full">
      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
          <p className="text-gray-600 mb-6">
            Customize how GigFlow looks for you.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-primary rounded-lg p-4 flex items-center justify-center bg-white">
                  <span className="text-sm font-medium">Light</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-100">
                  <span className="text-sm font-medium">Dark</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-100">
                  <span className="text-sm font-medium">System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default AppearanceSettings;
