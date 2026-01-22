import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/user/paypal - Get user's PayPal.Me username
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: { paypalMeUsername: true },
        });

        return NextResponse.json(
            { paypalMeUsername: user?.paypalMeUsername || null },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Get PayPal username error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/user/paypal - Update user's PayPal.Me username
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { paypalMeUsername } = body;

        // Validate username - allow empty string to clear, or alphanumeric with basic chars
        if (paypalMeUsername !== undefined && paypalMeUsername !== null && paypalMeUsername !== "") {
            // Remove any URL prefix if user pasted full URL
            let cleanUsername = paypalMeUsername;
            if (cleanUsername.includes("paypal.me/")) {
                cleanUsername = cleanUsername.split("paypal.me/")[1];
            }
            // Remove trailing slashes or query params
            cleanUsername = cleanUsername.split("?")[0].split("/")[0];

            // Validate: only alphanumeric and basic chars allowed
            const usernameRegex = /^[a-zA-Z0-9_-]+$/;
            if (!usernameRegex.test(cleanUsername)) {
                return NextResponse.json(
                    { error: "Invalid PayPal.Me username format" },
                    { status: 400, headers: corsHeaders }
                );
            }

            // Update with cleaned username
            const updatedUser = await prisma.user.update({
                where: { id: currentUser.userId },
                data: { paypalMeUsername: cleanUsername },
                select: { paypalMeUsername: true },
            });

            return NextResponse.json(
                {
                    paypalMeUsername: updatedUser.paypalMeUsername,
                    message: "PayPal.Me username updated successfully"
                },
                { headers: corsHeaders }
            );
        }

        // Clear username if empty or null
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: { paypalMeUsername: null },
            select: { paypalMeUsername: true },
        });

        return NextResponse.json(
            {
                paypalMeUsername: updatedUser.paypalMeUsername,
                message: "PayPal.Me username cleared"
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Update PayPal username error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
