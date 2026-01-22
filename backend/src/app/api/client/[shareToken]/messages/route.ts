import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers for public client access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to find workspace by share token or ID
async function findWorkspace(shareTokenOrId: string) {
    // Try by shareToken first
    let workspace = await prisma.workspace.findUnique({
        where: { shareToken: shareTokenOrId },
        select: { id: true },
    });

    // If not found, try by ID
    if (!workspace) {
        workspace = await prisma.workspace.findUnique({
            where: { id: shareTokenOrId },
            select: { id: true },
        });
    }

    return workspace;
}

// GET /api/client/[shareToken]/messages - Get messages (public, no auth)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params;
        const workspace = await findWorkspace(shareToken);

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const messages = await prisma.message.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ messages }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get client messages error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/client/[shareToken]/messages - Send message as client (public, no auth)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params;
        const workspace = await findWorkspace(shareToken);

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: "Message text is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Client messages always have sender = "client"
        const message = await prisma.message.create({
            data: {
                workspaceId: workspace.id,
                sender: "client",
                text: text.trim(),
            },
        });

        // Update workspace timestamp
        await prisma.workspace.update({
            where: { id: workspace.id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Create client message error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
