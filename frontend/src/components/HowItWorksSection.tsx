
import React from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Briefcase, FileText, MessageCircle, CreditCard, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const steps = [
  {
    icon: Briefcase,
    title: "Create Client Workspaces",
    description: "Set up personalized, secure workspaces for each client and organize everything in one place.",
    details: "Create branded portals for each client with customizable permissions. Keep all communications, files, and project details neatly organized and easily accessible in one central location."
  },
  {
    icon: FileText,
    title: "Share Files Securely",
    description: "Upload, organize, and share files with built-in version control and client approval workflows.",
    details: "Share documents securely with password protection and expiration dates. Track who viewed what and when. Get client approvals directly within the platform and maintain a clear history of all file versions."
  },
  {
    icon: MessageCircle,
    title: "Communicate Seamlessly",
    description: "Chat, video call, and collaborate with clients in real-time without switching between platforms.",
    details: "Eliminate the need for multiple communication tools. Send messages, host video meetings, share screens, and collaborate on documents—all within the same platform your clients already access."
  },
  {
    icon: CreditCard,
    title: "Get Paid Faster",
    description: "Create professional invoices, set up automatic payment reminders, and track all transactions.",
    details: "Generate branded invoices in seconds, accept online payments, and automate reminders for overdue invoices. Track all financial transactions and generate revenue reports to understand your business better."
  },
  {
    icon: Check,
    title: "Grow Your Business",
    description: "Analyze client data, identify growth opportunities, and scale your freelance business effectively.",
    details: "Leverage analytics to understand client behavior, identify upselling opportunities, and make data-driven decisions. Save time on admin work and focus on delivering exceptional services to grow your business."
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-blue-50 to-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-6 py-2 bg-blue-100 text-primary font-medium rounded-full">
              4-Step Success System
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              How GigFlow Transforms Your Workflow
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our proven system helps freelancers save 12+ hours weekly and increase client satisfaction by 92%.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Join 10,000+ Successful Freelancers</h3>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                GigFlow users report 43% higher productivity, 92% better client relationships, and an average 25% increase in revenue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink to="/signup">
                <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-primary font-medium hover:scale-105 transition-all shadow-md">
                  Start Now
                </Button>
              </NavLink>
              <NavLink to="/about">
                <Button size="lg" variant="ghost" className="rounded-full px-8 py-6 text-white font-medium border border-white/30 hover:bg-white/10 transition-all">
                  See Success Stories
                </Button>
              </NavLink>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorksSection;
