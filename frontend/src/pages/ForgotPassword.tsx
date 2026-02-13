import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            setSent(true);
        } catch (error) {
            // Error toast is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Forgot your password?</h1>
                        <p className="text-gray-500 mt-1">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700 text-sm">
                                    If an account with that email exists, we've sent a password reset link.
                                    Please check your inbox and spam folder.
                                </p>
                            </div>
                            <Link to="/login" className="text-blue-600 hover:underline text-sm">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="email">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send reset link"}
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm">
                        <p className="text-gray-500">
                            Remember your password?{" "}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
