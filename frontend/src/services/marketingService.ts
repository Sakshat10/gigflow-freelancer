
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
      description: "Create branded, password-protected client spaces with customizable access controls and seamless sharing.",
      color: "blue",
    },
    {
      icon: "Upload",
      title: "Smart File Management",
      description: "Organize files with version control, approval workflows, and automatic notifications when clients view documents.",
      color: "purple",
    },
    {
      icon: "MessageSquare",
      title: "Unified Communication",
      description: "Chat, video call, share screens, and collaborate in real-time without juggling multiple communication tools.",
      color: "green",
    },
    {
      icon: "FileText",
      title: "Professional Invoicing",
      description: "Generate branded invoices, set up recurring billing, and track payments with automated reminders and receipt generation.",
      color: "amber",
    },
    {
      icon: "Bell",
      title: "Client Engagement Tools",
      description: "Boost client satisfaction with automated follow-ups, feedback collection, and personalized communication.",
      color: "pink",
    },
    {
      icon: "CreditCard",
      title: "Flexible Growth Plans",
      description: "Scale your tools as your business grows with transparent pricing and no hidden fees or complicated contracts.",
      color: "indigo",
    }
  ];
};

export const fetchBentoCardData = async (): Promise<BentoCardData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      title: "Productivity Boost",
      value: "43%",
      subtitle: "Average increase in productivity for freelancers using GigFlow's integrated workspace",
      colors: ["#3B82F6", "#60A5FA", "#93C5FD"]
    },
    {
      title: "Client Retention",
      value: "92%",
      subtitle: "Of freelancers report improved client relationships and higher retention rates",
      colors: ["#60A5FA", "#34D399", "#93C5FD"]
    },
    {
      title: "Time Savings",
      value: "12hrs",
      subtitle: "Average weekly time saved on admin tasks, allowing focus on billable client work",
      colors: ["#F59E0B", "#A78BFA", "#FBCFE8"]
    },
    {
      title: "Global Community",
      value: "10,000+",
      subtitle: "Successful freelancers using GigFlow across 32 countries and growing",
      colors: ["#3B82F6", "#A78BFA", "#FBCFE8"]
    },
    {
      title: "Client Satisfaction",
      value: "4.9/5",
      subtitle: "Average client satisfaction score, based on 2,500+ verified reviews across all industries",
      colors: ["#EC4899", "#F472B6", "#3B82F6"]
    }
  ];
};
