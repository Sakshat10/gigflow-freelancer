import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/user/plan - Update user's subscription plan
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
        const { plan, subscriptionId } = body;

        // Validate plan
        const validPlans = ["free", "pro", "pro_plus"];
        if (!plan || !validPlans.includes(plan)) {
            return NextResponse.json(
                { error: "Invalid plan" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Update user's plan in the database
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: {
                plan: plan,
            },
            select: {
                id: true,
                email: true,
                name: true,
                company: true,
                plan: true,
                createdAt: true,
            },
        });

        console.log(`User ${currentUser.userId} plan updated to ${plan}. Subscription ID: ${subscriptionId || 'N/A'}`);

        return NextResponse.json(
            {
                user: updatedUser,
                message: `Plan updated to ${plan}`
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Update plan error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
