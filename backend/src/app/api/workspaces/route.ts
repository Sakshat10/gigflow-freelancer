import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import {
    getCurrentUser,
    unauthorizedResponse,
    successResponse,
    errorResponse,
} from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080", // Frontend origin
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/workspaces - List all workspaces for authenticated user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const workspaces = await prisma.workspace.findMany({
            where: { userId: user.userId },
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: {
                        messages: true,
                        todos: true,
                        invoices: true,
                        files: true,
                    },
                },
            },
        });

        return NextResponse.json({ workspaces }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get workspaces error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/workspaces - Create new workspace
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { name, description, clientEmail, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Workspace name is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Generate unique share token
        const shareToken = uuidv4();

        const workspace = await prisma.workspace.create({
            data: {
                userId: user.userId,
                name,
                description: description || null,
                clientEmail: clientEmail || null,
                color: color || "blue",
                shareToken,
            },
        });

        return NextResponse.json({ workspace }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Create workspace error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
