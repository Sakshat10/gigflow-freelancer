import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/user/me - Get current user profile
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
            select: {
                id: true,
                email: true,
                name: true,
                company: true,
                plan: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json({ user }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// PATCH /api/user/me - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { name, email, company } = body;

        // Validate required fields
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email.trim(),
                NOT: { id: currentUser.userId },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email is already in use" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: {
                name: name.trim(),
                email: email.trim(),
                company: company?.trim() || null,
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

        return NextResponse.json({ user: updatedUser }, { headers: corsHeaders });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
