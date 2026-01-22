import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/auth";

// GET /api/client/[shareToken]/todos - Get todos (read-only, public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params;

        const workspace = await prisma.workspace.findUnique({
            where: { shareToken },
            select: { id: true },
        });

        if (!workspace) {
            return errorResponse("Workspace not found", 404);
        }

        const todos = await prisma.todo.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "desc" },
        });

        return successResponse({ todos });
    } catch (error) {
        console.error("Get client todos error:", error);
        return errorResponse("Internal server error", 500);
    }
}

// Note: POST, PATCH, DELETE are NOT implemented for client
// Clients can only VIEW todos, not modify them
