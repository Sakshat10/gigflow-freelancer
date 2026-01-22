import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Check, Star, DollarSign, IndianRupee } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PayPalSubscriptionButton from "@/components/plans/PayPalSubscriptionButton";
import PayPalButtonPro from "@/components/plans/PayPalButtonPro";
import PayPalButtonProPlus from "@/components/plans/PayPalButtonProPlus";
import RazorpayButtonPro, { RazorpayButtonProProps } from "@/components/plans/RazorpayButtonPro";
import RazorpayButtonProPlus, { RazorpayButtonProPlusProps } from "@/components/plans/RazorpayButtonProPlus";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  inrPrice?: string;
  inrYearlyPrice?: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  onPlanSelect?: (planId: string, plan: PricingPlan, isMonthly: boolean) => void;
  currentPlan?: string;
  isCompact?: boolean;
  isIndian?: boolean;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  onPlanSelect,
  currentPlan,
  isCompact = true,
  isIndian = false
}: PricingProps) {
  const [isMonthly, setIsMonthly] = React.useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan | null>(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isSettingsPage = location.pathname.includes("/settings");
  const { user } = useAuth();
  
  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current && window.confetti) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      window.confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"]
      });
    }
  };

  const handlePlanClick = (plan: PricingPlan) => {
    if (isCurrentPlan(plan)) return;
    if (shouldDisableButton(plan)) return;
    if (isHomePage || plan.name === "FREE") {
      if (onPlanSelect) {
        const planId = plan.name.toLowerCase().replace(/\s+/g, '_');
        onPlanSelect(planId, plan, isMonthly);
      }
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setSelectedPlan(null);
  };

  const handlePlanSelectConfirm = () => {
    if (selectedPlan && onPlanSelect) {
      const planId = selectedPlan.name.toLowerCase().replace(/\s+/g, '_');
      onPlanSelect(planId, selectedPlan, isMonthly);
    }
    setShowPaymentDialog(false);
  };

  const getPlanButtonText = (plan: PricingPlan) => {
    if (currentPlan && currentPlan === plan.name.toLowerCase().replace(/\s+/g, '_')) {
      return "Current Plan";
    }
    if (shouldDisableButton(plan)) {
      return "Not Available";
    }
    return plan.buttonText;
  };

  const isCurrentPlan = (plan: PricingPlan) => {
    return currentPlan && currentPlan === plan.name.toLowerCase().replace(/\s+/g, '_');
  };

  const shouldDisableButton = (plan: PricingPlan) => {
    if (!currentPlan) return false;
    const planId = plan.name.toLowerCase().replace(/\s+/g, '_');
    if (currentPlan === "pro_plus" && (planId === "pro" || planId === "free")) {
      return true;
    }
    if (currentPlan === "pro" && planId === "free") {
      return true;
    }
    return false;
  };

  const containerClasses = isSettingsPage ? "w-full px-0 py-4" : "container py-20";
  
  // Get price display based on country
  const getPriceDisplay = (plan: PricingPlan, isYearly: boolean = false) => {
    if (isIndian) {
      const priceInINR = isYearly 
        ? (plan.inrYearlyPrice || convertToINR(plan.yearlyPrice))
        : (plan.inrPrice || convertToINR(plan.price));
      return (
        <span className="text-5xl font-bold tracking-tight text-foreground flex items-center">
          <IndianRupee className="h-6 w-6 mr-1" />
          {priceInINR}
        </span>
      );
    } else {
      return (
        <span className="text-5xl font-bold tracking-tight text-foreground flex items-center">
          <DollarSign className="h-6 w-6 mr-1" />
          {isYearly ? plan.yearlyPrice : plan.price}
        </span>
      );
    }
  };
  
  // Helper function to convert USD to INR (simplified)
  const convertToINR = (usdPrice: string): string => {
    const usd = parseFloat(usdPrice);
    // Using approximate conversion rate
    return (usd * 80).toFixed(0); 
  };

  // Fixed function to properly return React nodes for payment buttons
  const renderPaymentButtons = (selectedPlan: PricingPlan): React.ReactNode => {
    if (!selectedPlan) return null;
    
    console.log('Rendering payment buttons. isIndian:', isIndian);
    
    if (isIndian) {
      // Show Razorpay buttons for Indian users
      if (selectedPlan.name === "PRO") {
        return (
          <RazorpayButtonPro 
            onSuccess={handlePlanSelectConfirm}
            isMonthly={isMonthly}
          />
        );
      } else if (selectedPlan.name === "PRO PLUS") {
        return (
          <RazorpayButtonProPlus 
            onSuccess={handlePlanSelectConfirm}
            isMonthly={isMonthly}
          />
        );
      }
    } else {
      // Show PayPal buttons for non-Indian users
      if (selectedPlan.name === "PRO") {
        return (
          <PayPalButtonPro 
            planId="P-5ML4271244454362WXNWU5NQ"
            isMonthly={isMonthly}
            onSuccess={handlePlanSelectConfirm}
          />
        );
      } else if (selectedPlan.name === "PRO PLUS") {
        return (
          <PayPalButtonProPlus 
            planId="P-8N52040575026411NXNWU5WA"
            isMonthly={isMonthly}
            onSuccess={handlePlanSelectConfirm}
          />
        );
      }
    }
    
    return null;
  };

  return <div className="px-[13px]">
    {(title || description) && <div className="text-center space-y-4 mb-12">
      {title && <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>}
      {description && <p className="text-muted-foreground text-lg whitespace-pre-line">
        {description}
      </p>}
    </div>}

    <div className="flex justify-center mb-10">
      <label className="relative inline-flex items-center cursor-pointer">
        <Label>
          <Switch ref={switchRef as any} checked={!isMonthly} onCheckedChange={handleToggle} className="relative" />
        </Label>
      </label>
      <span className="ml-2 font-semibold">
        Annual billing <span className="text-primary">(Save 20%)</span>
      </span>
    </div>

    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", isCompact ? "max-w-5xl mx-auto" : "w-full")}>
      {plans.map((plan, index) => <div key={index} className={cn(`rounded-2xl border-[1px] p-6 bg-background text-center lg:flex lg:flex-col lg:justify-center relative transform transition-all duration-300`, plan.isPopular ? "border-primary border-2" : "border-border", "flex flex-col", !plan.isPopular && "mt-5", isDesktop && plan.isPopular && "-translate-y-4", isDesktop && (index === 0 || index === 2) && isCompact && "scale-95", index === 0 || index === 2 ? "z-0" : "z-10")}>
        {plan.isPopular && <div className="absolute top-0 right-0 bg-primary py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
          <Star className="text-primary-foreground h-4 w-4 fill-current" />
          <span className="text-primary-foreground ml-1 font-sans font-semibold">
            Popular
          </span>
        </div>}
        <div className="flex-1 flex flex-col">
          <p className="text-base font-semibold text-muted-foreground">
            {plan.name}
          </p>
          <div className="mt-6 flex items-center justify-center gap-x-2">
            {getPriceDisplay(plan, !isMonthly)}
            {plan.period !== "Next 3 months" && <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                / {plan.period}
              </span>}
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            {isMonthly ? "billed monthly" : "billed annually"}
          </p>

          <ul className="mt-5 gap-2 flex flex-col">
            {plan.features.map((feature, idx) => <li key={idx} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-left">{feature}</span>
            </li>)}
          </ul>

          <hr className="w-full my-4" />

          {plan.name !== "FREE" ? (
            <>
              {(isCurrentPlan(plan)) && (
                <button disabled className={cn(buttonVariants({ variant: "secondary" }), "w-full bg-muted text-muted-foreground cursor-not-allowed")}>
                  Current Plan
                </button>
              )}
              {(shouldDisableButton(plan)) && (
                <button disabled className={cn(buttonVariants({ variant: "outline" }), "w-full bg-gray-100 text-gray-400 cursor-not-allowed")}>
                  Not Available
                </button>
              )}
              {(!isCurrentPlan(plan) && !shouldDisableButton(plan)) && (
                <button 
                  onClick={() => handlePlanClick(plan)} 
                  className={cn(buttonVariants({ variant: plan.isPopular ? "default" : "outline" }), "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter", "transform-gpu ring-offset-current transition-all duration-300 ease-out", "hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground", plan.isPopular ? "bg-primary text-primary-foreground" : "bg-background text-foreground")}
                >
                  {getPlanButtonText(plan)}
                </button>
              )}
            </>
          ) : (
            <button onClick={() => handlePlanClick(plan)} disabled={isCurrentPlan(plan)} className={cn(buttonVariants({
              variant: isCurrentPlan(plan) ? "secondary" : "outline"
            }), "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter", "transform-gpu ring-offset-current transition-all duration-300 ease-out", !isCurrentPlan(plan) && "hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground", plan.isPopular && !isCurrentPlan(plan) ? "bg-primary text-primary-foreground" : isCurrentPlan(plan) ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-background text-foreground")}>
              {getPlanButtonText(plan)}
            </button>
          )}

          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            {plan.description}
          </p>
        </div>
      </div>)}
    </div>

    <AlertDialog open={showPaymentDialog} onOpenChange={handlePaymentDialogClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedPlan ? `Upgrade to ${selectedPlan.name}` : 'Upgrade Plan'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose your payment method to complete the subscription.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {selectedPlan && <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex justify-between mb-2">
              <span>Plan:</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Price:</span>
              <span className="font-medium">
                {isIndian ? (
                  <>
                    ₹{isMonthly 
                      ? (selectedPlan.inrPrice || convertToINR(selectedPlan.price))
                      : (selectedPlan.inrYearlyPrice || convertToINR(selectedPlan.yearlyPrice))
                    }
                    {selectedPlan.period !== "Next 3 months" && <span className="text-sm text-gray-500">
                      /{selectedPlan.period}
                    </span>}
                  </>
                ) : (
                  <>
                    ${isMonthly ? selectedPlan.price : selectedPlan.yearlyPrice}
                    {selectedPlan.period !== "Next 3 months" && <span className="text-sm text-gray-500">
                      /{selectedPlan.period}
                    </span>}
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-medium">{isMonthly ? 'Monthly' : 'Annual'}</span>
            </div>
          </div>}

        {/* Show the appropriate payment button based on user's location */}
        {selectedPlan && (
          <div className="mb-4">
            {renderPaymentButtons(selectedPlan)}
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
