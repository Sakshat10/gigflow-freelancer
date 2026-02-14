import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");

                    // Update cached user data so the auth gate lets them through
                    try {
                        const stored = localStorage.getItem("gigflow_user");
                        if (stored) {
                            const user = JSON.parse(stored);
                            user.emailVerified = true;
                            localStorage.setItem("gigflow_user", JSON.stringify(user));
                        }
                    } catch {
                        // ignore localStorage errors
                    }
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed");
                }
            } catch {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded-lg p-6 space-y-6 text-center">
                    {status === "loading" && (
                        <>
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                            <p className="text-gray-500">Verifying your email...</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="text-5xl">✅</div>
                            <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
                            <p className="text-gray-500">{message}</p>
                            <button
                                onClick={() => window.location.href = "/dashboard"}
                                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="text-5xl">❌</div>
                            <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
                            <p className="text-gray-500">{message}</p>
                            <p className="text-sm text-gray-400">
                                This link may have already been used or expired. Try logging in — if your email was already verified, you'll be taken to the dashboard.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
