import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    yearlyPrice: "$0",
    description: "Get started with basic features",
    features: [
      "Up to 3 workspaces",
      "Basic chat",
      "Limited file storage",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    yearlyPrice: "$99.99",
    description: "Perfect for growing freelancers",
    features: [
      "Unlimited workspaces",
      "Priority chat support",
      "Invoice generation",
      "10GB file storage",
    ],
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: "$19.99",
    yearlyPrice: "$199.99",
    description: "For power users and agencies",
    features: [
      "Everything in Pro",
      "AI-powered emails",
      "Document generation",
      "Unlimited storage",
      "White-label options",
    ],
  },
];

interface PricingSectionProps {
  onPlanSelect?: (planId: string, plan: any, isMonthly: boolean) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMonthly, setIsMonthly] = React.useState(true);

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    
    if (onPlanSelect) {
      onPlanSelect(plan.id, plan, isMonthly);
    } else {
      navigate("/settings/pricing");
    }
  };

  return (
    <section className="w-full py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Simple, transparent pricing</h2>
        <p className="text-muted-foreground">Choose the plan that fits your freelancing needs</p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant={isMonthly ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </Button>
          <Button
            variant={!isMonthly ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonthly(false)}
          >
            Yearly (Save 17%)
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto px-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {isMonthly ? plan.price : plan.yearlyPrice}
                <span className="text-sm font-normal text-muted-foreground">
                  /{isMonthly ? "mo" : "yr"}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={user?.plan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                onClick={() => handlePlanClick(plan)}
                disabled={user?.plan === plan.id}
              >
                {user?.plan === plan.id ? "Current Plan" : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
