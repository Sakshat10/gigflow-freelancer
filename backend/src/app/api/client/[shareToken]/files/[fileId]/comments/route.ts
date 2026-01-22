import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers for public access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/client/[shareToken]/files/[fileId]/comments - Get comments for a file (client side)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string; fileId: string }> }
) {
    try {
        const { shareToken, fileId } = await params;

        // Find workspace by share token or ID
        let workspace = await prisma.workspace.findUnique({
            where: { shareToken },
        });

        if (!workspace) {
            workspace = await prisma.workspace.findUnique({
                where: { id: shareToken },
            });
        }

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Verify file belongs to workspace
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.workspaceId !== workspace.id) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const comments = await prisma.fileComment.findMany({
            where: { fileId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ comments }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get comments error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/client/[shareToken]/files/[fileId]/comments - Add comment to a file (client side)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string; fileId: string }> }
) {
    try {
        const { shareToken, fileId } = await params;
        const body = await request.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: "Comment text is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Find workspace by share token or ID
        let workspace = await prisma.workspace.findUnique({
            where: { shareToken },
        });

        if (!workspace) {
            workspace = await prisma.workspace.findUnique({
                where: { id: shareToken },
            });
        }

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Verify file belongs to workspace
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.workspaceId !== workspace.id) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const comment = await prisma.fileComment.create({
            data: {
                fileId,
                sender: "client",
                text: text.trim(),
            },
        });

        return NextResponse.json({ comment }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Add comment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
