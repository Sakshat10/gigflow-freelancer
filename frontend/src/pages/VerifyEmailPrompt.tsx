import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VerifyEmailPrompt: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResendEmail = async () => {
        setResending(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                setResent(true);
                toast.success("Verification email sent! Check your inbox.");
            } else {
                toast.error(data.error || "Failed to resend verification email");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setResending(false);
        }
    };

    const handleCheckVerification = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.user.emailVerified) {
                    toast.success("Email verified! Redirecting to dashboard...");
                    // Force a page reload to re-initialize auth state
                    window.location.href = "/dashboard";
                } else {
                    toast("Email not yet verified. Please check your inbox.");
                }
            }
        } catch {
            toast.error("Could not check verification status.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded-lg p-8 space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Verify your email</h1>
                        <p className="text-gray-500 mt-2">
                            We've sent a verification link to
                        </p>
                        <p className="text-gray-800 font-medium mt-1">
                            {user?.email || "your email address"}
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                        <p>Please check your inbox and click the verification link to continue using GigFlow.</p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleCheckVerification}
                            className="w-full"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            I've verified my email
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleResendEmail}
                            disabled={resending || resent}
                            className="w-full"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${resending ? "animate-spin" : ""}`} />
                            {resent
                                ? "Email sent! Check your inbox"
                                : resending
                                    ? "Sending..."
                                    : "Resend verification email"}
                        </Button>

                        <button
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Sign out and use a different account
                        </button>
                    </div>

                    <p className="text-xs text-gray-400">
                        Didn't receive the email? Check your spam folder or click "Resend" above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPrompt;
