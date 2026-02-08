
import React from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Briefcase, FileText, MessageCircle, CreditCard, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const steps = [
  {
    icon: Briefcase,
    title: "Create a client workspace",
    description: "One workspace per client. Keep everything separate and organized.",
    details: "Set up a workspace in seconds. Add your client's name, and you're ready to go. No complicated setup, no confusion."
  },
  {
    icon: FileText,
    title: "Share files, chat, and tasks",
    description: "Upload files, chat with your client, and manage tasks — all in one place.",
    details: "Stop switching between WhatsApp, email, and Google Drive. Everything your client needs is inside their workspace."
  },
  {
    icon: CreditCard,
    title: "Send invoices and get paid",
    description: "Create invoices, send them to clients, and track payments in one place.",
    details: "No more awkward payment follow-ups. Send professional invoices directly from the workspace and see when they're paid."
  },
  {
    icon: Check,
    title: "Manage everything from one dashboard",
    description: "See all your clients, tasks, and payments in one simple dashboard.",
    details: "No more digging through emails or chats. Everything you need to run your freelance work is in one place."
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-blue-50 to-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Simple steps to organize your freelance work and get paid professionally.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={(index * 100 > 500 ? "500" : (index * 100).toString()) as any}>
              <div className="bg-white rounded-xl shadow-lg border border-blue-50 p-8 h-full transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                    {React.createElement(step.icon, { className: "h-8 w-8 text-primary" })}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  <div className="mt-auto bg-blue-50 p-4 rounded-lg text-gray-700 text-sm">
                    {step.details}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        
        <FadeIn delay="400">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 md:p-12 text-center max-w-4xl mx-auto text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to organize your freelance work?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Start with one free client workspace. No credit card required.
            </p>
            <NavLink to="/signup">
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-primary font-medium hover:scale-105 transition-all shadow-md">
                Start Free
              </Button>
            </NavLink>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorksSection;
