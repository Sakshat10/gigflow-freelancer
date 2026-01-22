import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

// GET /api/workspaces/[id]/files/[fileId]/comments - Get comments for a file
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fileId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, fileId } = await params;

        // Verify file exists and belongs to workspace
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.workspaceId !== id) {
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

// POST /api/workspaces/[id]/files/[fileId]/comments - Add comment to a file
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fileId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, fileId } = await params;
        const body = await request.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: "Comment text is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify file exists and belongs to workspace
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.workspaceId !== id) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const comment = await prisma.fileComment.create({
            data: {
                fileId,
                sender: "freelancer",
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
