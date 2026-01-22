import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getCurrentUser,
    unauthorizedResponse,
    forbiddenResponse,
    successResponse,
    errorResponse,
} from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to verify workspace ownership
async function verifyWorkspaceOwnership(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        return { error: "not_found" };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden" };
    }

    return { error: null };
}

// GET /api/workspaces/[id]/todos - Get workspace todos
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id } = await params;
        const { error } = await verifyWorkspaceOwnership(id, user.userId);

        if (error === "not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "forbidden") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        const todos = await prisma.todo.findMany({
            where: { workspaceId: id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ todos }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get todos error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/workspaces/[id]/todos - Create todo
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id } = await params;
        const { error } = await verifyWorkspaceOwnership(id, user.userId);

        if (error === "not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "forbidden") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { title, status } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Todo title is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const todo = await prisma.todo.create({
            data: {
                workspaceId: id,
                title,
                status: status || "todo",
            },
        });

        return NextResponse.json({ todo }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Create todo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
