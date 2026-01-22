type PlanFeature =
  | "chat"
  | "files"
  | "things"
  | "invoices"
  | "documents"
  | "emailBlaster"
  | "clientManagement";

interface PlanFeatures {
  [key: string]: PlanFeature[];
}

const planFeatures: PlanFeatures = {
  "free": ["chat", "files", "things", "emailBlaster"],
  "pro": ["chat", "files", "things", "invoices", "documents", "emailBlaster"],
  "pro_plus": ["chat", "files", "things", "invoices", "documents", "emailBlaster", "clientManagement"]
};

// Maps features to their required plan level
export const featureRequiredPlan: Record<PlanFeature, string> = {
  "chat": "free",
  "files": "free",
  "things": "free",
  "invoices": "pro",
  "documents": "pro",
  "emailBlaster": "free", // Changed from pro_plus for testing
  "clientManagement": "pro_plus"
};

export const hasFeatureAccess = (userPlan: string | undefined, feature: PlanFeature): boolean => {
  if (!userPlan) return false;

  // Convert to lowercase and normalize for comparison
  const normalizedPlan = userPlan.toLowerCase().replace(/\s+/g, '_');

  return planFeatures[normalizedPlan]?.includes(feature) || false;
};

export const getPlanFeatures = (plan: string): PlanFeature[] => {
  // Convert to lowercase and normalize for comparison
  const normalizedPlan = plan.toLowerCase().replace(/\s+/g, '_');

  return planFeatures[normalizedPlan] || [];
};

export const getFeatureLabel = (feature: PlanFeature): string => {
  const labels: Record<PlanFeature, string> = {
    "chat": "Client Chat",
    "files": "File Sharing",
    "things": "Task Management",
    "invoices": "Invoicing",
    "documents": "Document Generation",
    "emailBlaster": "Client Email Blaster",
    "clientManagement": "Client Management"
  };

  return labels[feature] || feature;
};

export const getRequiredPlanForFeature = (feature: PlanFeature): string => {
  return featureRequiredPlan[feature] || "free";
};

export const getNextUpgradePlan = (currentPlan: string | undefined): string | null => {
  if (!currentPlan) return "pro";

  const normalizedPlan = currentPlan.toLowerCase().replace(/\s+/g, '_');

  if (normalizedPlan === "free") return "pro";
  if (normalizedPlan === "pro") return "pro_plus";

  return null; // Already on the highest plan
};

export const getPlanDisplayName = (plan: string): string => {
  const normalizedPlan = plan.toLowerCase().replace(/\s+/g, '_');

  if (normalizedPlan === "free") return "Free";
  if (normalizedPlan === "pro") return "Pro";
  if (normalizedPlan === "pro_plus") return "Pro Plus";

  return plan; // Return original if not recognized
};

export const planTimelineContents = [
  {
    title: "Free Plan",
    description: "Great for getting started",
    features: [
      "Client Chat",
      "File Sharing",
      "Task Management",
      "1 active workspace",
      "500MB storage"
    ]
  },
  {
    title: "Pro Plan",
    description: "For growing freelancers",
    features: [
      "Everything in Free",
      "Invoicing",
      "Document Generation",
      "Unlimited workspaces",
      "5GB storage"
    ]
  },
  {
    title: "Pro Plus Plan",
    description: "For established professionals",
    features: [
      "Everything in Pro",
      "Client Email Blaster",
      "Client Management",
      "Priority support",
      "10GB storage"
    ]
  }
];
