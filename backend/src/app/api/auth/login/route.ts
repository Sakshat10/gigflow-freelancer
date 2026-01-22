import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    verifyPassword,
    generateToken,
    setAuthCookie,
    successResponse,
    errorResponse,
} from "@/lib/auth";
import { getCorsHeaders } from "@/lib/cors";

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get("origin");
    return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        // Create response with cookie
        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    plan: user.plan,
                },
            },
            { status: 200, headers: corsHeaders }
        );

        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
