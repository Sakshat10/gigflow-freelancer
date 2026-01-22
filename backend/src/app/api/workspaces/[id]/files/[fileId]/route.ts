import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// DELETE /api/workspaces/[id]/files/[fileId] - Delete a file
export async function DELETE(
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

        // Verify workspace ownership
        const workspace = await prisma.workspace.findUnique({
            where: { id },
        });

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        if (workspace.userId !== user.userId) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        // Find the file
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.workspaceId !== id) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Try to delete physical file (ignore errors if file doesn't exist)
        try {
            const filePath = path.join(process.cwd(), file.fileUrl);
            await unlink(filePath);
        } catch (e) {
            console.warn("Could not delete physical file:", e);
        }

        // Delete from database (comments will cascade)
        await prisma.file.delete({
            where: { id: fileId },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("Delete file error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// GET /api/workspaces/[id]/files/[fileId] - Get single file with comments
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

        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: {
                comments: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!file || file.workspaceId !== id) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json({ file }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get file error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
