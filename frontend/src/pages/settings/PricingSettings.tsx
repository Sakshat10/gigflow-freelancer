import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, X } from "lucide-react";
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
    price: "$9.99/mo",
    description: "Freelancers who want to get paid professionally",
    features: [
      "Up to 5 client workspaces",
      "Everything in Free",
      "Send invoices to clients",
      "Payment tracking",
    ],
    cta: "Start Getting Paid",
    popular: true,
    paypalPlanId: PRO_PLAN_ID,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: "$19.99/mo",
    description: "Power users & agencies",
    features: [
      "Unlimited client workspaces",
      "Everything in Pro",
      "Contracts & document generation",
      "Client updates",
    ],
    cta: "Run Your Business",
    paypalPlanId: PRO_PLUS_PLAN_ID,
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

            {/* Conversion Micro-Copy */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                One paid client covers your GigFlow subscription.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="mt-12">
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
          </CardContent>
        </Card>
      </div>
    </PayPalScriptProvider>
  );
};

export default PricingSettings;
