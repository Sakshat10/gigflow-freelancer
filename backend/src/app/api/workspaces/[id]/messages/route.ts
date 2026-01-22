import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notificationHelper";

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

// GET /api/workspaces/[id]/messages - Get workspace messages
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

        const messages = await prisma.message.findMany({
            where: { workspaceId: id },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ messages }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get messages error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/workspaces/[id]/messages - Create message (freelancer)
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
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { error: "Message text is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const message = await prisma.message.create({
            data: {
                workspaceId: id,
                sender: "freelancer",
                text,
            },
        });

        // Update workspace timestamp
        await prisma.workspace.update({
            where: { id },
            data: { updatedAt: new Date() },
        });

        // Note: Client messages would trigger notifications for freelancer
        // Since this is freelancer POST endpoint, no notification needed here
        // Client messages come through a different endpoint

        return NextResponse.json({ message }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Create message error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
