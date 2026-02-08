import React from "react";
import { Check, X } from "lucide-react";
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
    description: "Explore GigFlow with one client",
    features: [
      "1 client workspace",
      "Client chat",
      "File sharing",
      "Tasks & to-dos",
      "Invoice drafts",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    yearlyPrice: "$99.99",
    description: "Freelancers who want to get paid professionally",
    features: [
      "Up to 5 client workspaces",
      "Everything in Free",
      "Send invoices to clients",
      "Payment tracking",
    ],
    cta: "Start Getting Paid",
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: "$19.99",
    yearlyPrice: "$199.99",
    description: "Scale your freelance business",
    features: [
      "Unlimited client workspaces",
      "Everything in Pro",
      "Contracts & document generation",
      "Client updates",
    ],
    cta: "Run Your Business",
  },
];

const comparisonFeatures = [
  { name: "Client workspaces", free: "1", pro: "Up to 5", proPLus: "Unlimited" },
  { name: "Client chat", free: true, pro: true, proPLus: true },
  { name: "File sharing", free: true, pro: true, proPLus: true },
  { name: "Tasks & to-dos", free: true, pro: true, proPLus: true },
  { name: "Invoice drafts", free: true, pro: true, proPLus: true },
  { name: "Send invoices", free: false, pro: true, proPLus: true },
  { name: "Payment tracking", free: false, pro: true, proPLus: true },
  { name: "Contracts & documents", free: false, pro: false, proPLus: true },
  { name: "Client updates", free: false, pro: false, proPLus: true },
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
                {user?.plan === plan.id ? "Current Plan" : plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Micro-Copy */}
      <div className="text-center mt-8 px-4">
        <p className="text-sm text-muted-foreground">
          One paid client covers your GigFlow subscription.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Compare Plans</h3>
          <p className="text-muted-foreground">
            Choose the plan that matches how you work today — upgrade anytime.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-semibold text-sm">Feature</th>
                <th className="text-center p-4 font-semibold text-sm">Free</th>
                <th className="text-center p-4 font-semibold text-sm bg-primary/5">Pro</th>
                <th className="text-center p-4 font-semibold text-sm">Pro Plus</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50/50">
                  <td className="p-4 text-sm">{feature.name}</td>
                  <td className="p-4 text-center text-sm">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.free}</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm bg-primary/5">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.pro}</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof feature.proPLus === 'boolean' ? (
                      feature.proPLus ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.proPLus}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Guidance Copy */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Free is best to explore GigFlow. Pro is best for getting paid. Pro Plus is best for scaling your work.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
