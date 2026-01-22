import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
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
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080", // Frontend origin
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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
        return { error: "not_found", workspace: null };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden", workspace: null };
    }

    return { error: null, workspace };
}

// GET /api/workspaces/[id] - Get single workspace
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
        const { error, workspace } = await verifyWorkspaceOwnership(id, user.userId);

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

        // Get workspace with related data
        const fullWorkspace = await prisma.workspace.findUnique({
            where: { id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                todos: { orderBy: { createdAt: "desc" } },
                invoices: { orderBy: { createdAt: "desc" } },
                files: { orderBy: { uploadedAt: "desc" } },
            },
        });

        return NextResponse.json({ workspace: fullWorkspace }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get workspace error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// PATCH /api/workspaces/[id] - Update workspace
export async function PATCH(
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
        const { name, description, clientEmail } = body;

        const workspace = await prisma.workspace.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(clientEmail !== undefined && { clientEmail }),
            },
        });

        return NextResponse.json({ workspace }, { headers: corsHeaders });
    } catch (error) {
        console.error("Update workspace error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// DELETE /api/workspaces/[id] - Delete workspace
export async function DELETE(
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

        await prisma.workspace.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Workspace deleted successfully" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Delete workspace error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
