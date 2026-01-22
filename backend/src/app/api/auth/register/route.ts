import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    hashPassword,
    generateToken,
    setAuthCookie,
    successResponse,
    errorResponse,
} from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
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
        const { email, password, name, paypalMeUsername } = body;

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409, headers: corsHeaders }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                plan: "free",
                paypalMeUsername: paypalMeUsername || null,
            },
        });

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
            { status: 201, headers: corsHeaders }
        );

        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: getCorsHeaders(origin) }
        );
    }
}
