import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";
const PRO_PLAN_ID = import.meta.env.VITE_PRO_PLAN_ID || "";
const PRO_PLUS_PLAN_ID = import.meta.env.VITE_PRO_PLUS_PLAN_ID || "";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
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
    price: "$9.99/mo",
    description: "Perfect for growing freelancers",
    features: [
      "Unlimited workspaces",
      "Priority chat support",
      "Invoice generation",
      "10GB file storage",
    ],
    popular: true,
    paypalPlanId: PRO_PLAN_ID,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: "$19.99/mo",
    description: "For power users and agencies",
    features: [
      "Everything in Pro",
      "AI-powered emails",
      "Document generation",
      "Unlimited storage",
      "White-label options",
    ],
    paypalPlanId: PRO_PLUS_PLAN_ID,
  },
];

const PricingSettings: React.FC = () => {
  const { user, upgradePlan } = useAuth();

  const handlePlanSelect = async (planId: string) => {
    if (user?.plan === planId) {
      toast.info("You are already on this plan");
      return;
    }

    if (planId === "free") {
      await upgradePlan("free");
    } else {
      toast.info("Payment integration will be available once the backend is connected");
    }
  };

  const handlePayPalSubscriptionApproval = async (planId: "pro" | "pro_plus", subscriptionId: string) => {
    // Update user's plan after successful subscription
    await upgradePlan(planId, subscriptionId);
    toast.success(`Subscription successful! ID: ${subscriptionId}`);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        vault: true,
        intent: "subscription",
        dataSdkIntegrationSource: "button-factory",
      }}
    >
      <div className="w-full">
        <Card className="w-full mx-auto border-0 shadow-none">
          <CardHeader className="space-y-1 px-4 pb-6">
            <CardTitle className="text-2xl">Pricing</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs.
            </CardDescription>
            {user && (
              <p className="text-sm font-medium mt-2">
                Current plan: <span className="uppercase text-primary">{user.plan}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="grid gap-6 px-4">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? "border-primary shadow-md" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {/* Show PayPal button for Pro plan only if user is on free */}
                    {plan.id === "pro" && user?.plan === "free" ? (
                      <div id="paypal-button-container-P-84G532022D7433127NFYGD3Q">
                        <PayPalButtons
                          style={{
                            shape: "rect",
                            color: "silver",
                            layout: "vertical",
                            label: "subscribe",
                          }}
                          createSubscription={(data, actions) => {
                            return actions.subscription.create({
                              plan_id: PRO_PLAN_ID,
                            });
                          }}
                          onApprove={async (data) => {
                            if (data.subscriptionID) {
                              await handlePayPalSubscriptionApproval("pro", data.subscriptionID);
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            toast.error("Payment failed. Please try again.");
                          }}
                        />
                      </div>
                    ) : plan.id === "pro_plus" && user?.plan !== "pro_plus" ? (
                      <div id="paypal-button-container-P-5LM84565Y6426231ENFYHCCQ">
                        <PayPalButtons
                          style={{
                            shape: "rect",
                            color: "silver",
                            layout: "vertical",
                            label: "subscribe",
                          }}
                          createSubscription={(data, actions) => {
                            return actions.subscription.create({
                              plan_id: PRO_PLUS_PLAN_ID,
                            });
                          }}
                          onApprove={async (data) => {
                            if (data.subscriptionID) {
                              await handlePayPalSubscriptionApproval("pro_plus", data.subscriptionID);
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            toast.error("Payment failed. Please try again.");
                          }}
                        />
                      </div>
                    ) : user?.plan === plan.id ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PayPalScriptProvider>
  );
};

export default PricingSettings;
