
import { PricingPlan, Feature, BentoCardData } from "@/types";

// Fetch pricing plans (mock data)
export const fetchPricingPlans = async (): Promise<PricingPlan[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      name: "FREE",
      price: "0",
      yearlyPrice: "0",
      period: "per month",
      features: [
        "1 client workspace",
        "Secure file sharing",
        "Real-time messaging",
        "Task management"
      ],
      description: "Perfect for freelancers just starting out",
      buttonText: "Start for Free",
      href: "/signup",
      isPopular: false,
    },
    {
      name: "PRO",
      price: "499",
      yearlyPrice: "4999",
      period: "per month",
      features: [
        "Up to 5 client workspaces",
        "Advanced file collaboration",
        "Voice & text messaging",
        "Professional invoicing",
        "Contract templates",
        "Growth analytics"
      ],
      description: "Ideal for growing freelance businesses",
      buttonText: "Buy Now",
      href: "/signup",
      isPopular: true,
      paypalPlanId: "P-5YD29212GD971384NNACVGCQ",
      // Indian prices
      inrPrice: "499",
      inrYearlyPrice: "4999"
    },
    {
      name: "PRO PLUS",
      price: "999",
      yearlyPrice: "9999",
      period: "per month",
      features: [
        "Unlimited client workspaces",
        "Custom branding options",
        "Client email automation",
        "Advanced CRM tools",
        "Comprehensive analytics",
        "Priority support",
        "API access"
      ],
      description: "For established freelance agencies",
      buttonText: "Buy Now",
      href: "/signup",
      isPopular: false,
      // Indian prices
      inrPrice: "999",
      inrYearlyPrice: "9999"
    }
  ];
};

// Fetch features (mock data)
export const fetchFeatures = async (): Promise<Feature[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      icon: "KeyRound",
      title: "Secure Client Workspaces",
      description: "One private workspace per client. Keep chat, files, tasks, and invoices together — no mixing clients, no confusion.",
      color: "blue",
    },
    {
      icon: "Upload",
      title: "Never lose files again",
      description: "Upload files once. Clients always see the latest version. No re-sending on WhatsApp.",
      color: "purple",
    },
    {
      icon: "MessageSquare",
      title: "One chat your client actually uses",
      description: "Stop switching between WhatsApp, email, and calls. Everything stays inside the workspace.",
      color: "green",
    },
    {
      icon: "FileText",
      title: "Professional Invoicing",
      description: "Send invoices without awkward follow-ups. Create invoices, send them to clients, and track payments in one place.",
      color: "amber",
    },
    {
      icon: "Bell",
      title: "Client Updates",
      description: "Keep clients in the loop with project updates. No more \"kya progress hai?\" messages.",
      color: "pink",
    },
    {
      icon: "CreditCard",
      title: "Simple Pricing",
      description: "Start free with one client. Upgrade when you're ready. No contracts, cancel anytime.",
      color: "indigo",
    }
  ];
};

export const fetchBentoCardData = async (): Promise<BentoCardData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      title: "Fewer Payment Follow-ups",
      value: "💸",
      subtitle: "Send invoices directly from the workspace. Clients see them, you get paid faster.",
      colors: ["#3B82F6", "#60A5FA", "#93C5FD"]
    },
    {
      title: "No More File Confusion",
      value: "📁",
      subtitle: "Upload once. Clients always see the latest version. No more WhatsApp file hunting.",
      colors: ["#60A5FA", "#34D399", "#93C5FD"]
    },
    {
      title: "Everything in One Place",
      value: "🧩",
      subtitle: "Chat, files, tasks, invoices — all inside one client workspace. No tool switching.",
      colors: ["#F59E0B", "#A78BFA", "#FBCFE8"]
    },
    {
      title: "Look Professional",
      value: "✨",
      subtitle: "Even if you're working solo, your clients see a clean, organized workspace.",
      colors: ["#8B5CF6", "#A78BFA", "#C4B5FD"]
    },
    {
      title: "Start Free",
      value: "🚀",
      subtitle: "One free client workspace. No credit card. Upgrade when you're ready.",
      colors: ["#EC4899", "#F472B6", "#3B82F6"]
    }
  ];
};
