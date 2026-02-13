
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserCountry } from "@/utils/countryDetection";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  country: z.enum(['india', 'foreign'], {
    required_error: "Please select your country"
  }),
  paypalMeUsername: z.string().optional().refine(
    (val) => !val || /^[a-zA-Z0-9]+$/.test(val),
    { message: "PayPal.me username should only contain letters and numbers" }
  ),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, signup } = useAuth();

  // Check if user selected a plan before signup
  const selectedPlanId = sessionStorage.getItem("selectedPlanId");
  const selectedPlanBilling = sessionStorage.getItem("selectedPlanBilling");

  // If user is already logged in, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      // If they selected a plan before signup, redirect to pricing settings
      if (selectedPlanId) {
        navigate("/settings/pricing");
        return;
      }

      // Otherwise redirect to dashboard
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, selectedPlanId]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "foreign",
      paypalMeUsername: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setLoading(true);

      // Use our new backend authentication
      const { user, error } = await signup(data.name, data.email, data.password, undefined, data.paypalMeUsername);

      if (error) throw error;

      // Mark this as a first-time user for the tour
      localStorage.setItem('first_time_user', 'true');

      // Reset workspace creation flag - they haven't created any workspaces yet
      localStorage.setItem('first_workspace_created', 'false');

      // Store the country for use after login - THIS IS THE CRITICAL PART
      setUserCountry(data.country);
      console.log('Country stored during signup:', data.country);

      toast.success("Your account has been created successfully");

      // Redirect to email verification prompt
      navigate("/verify-email-prompt");
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "An unexpected error occurred";

      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please log in instead.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determine if payment option hint should show Razorpay or PayPal
  const selectedCountry = form.watch('country');
  const paymentOption = selectedCountry === 'india' ? 'Razorpay' : 'PayPal';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-gray-500 mt-2">
              Join thousands of freelancers using GigFlow
            </p>
            {selectedPlanId && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                <p className="font-medium">
                  You'll be shown payment options after signup
                  {` (${paymentOption})`}
                </p>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="foreign">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This helps us show you the appropriate payment options
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paypalMeUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PayPal.me Username (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="yourpaypalusername" {...field} />
                    </FormControl>
                    <FormDescription>
                      Required for creating invoices. You can add this later in settings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            By creating an account, you agree to our{" "}
            <Link to="/disclaimer" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
