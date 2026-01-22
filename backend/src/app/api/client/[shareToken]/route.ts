import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/auth";

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

// GET /api/client/[shareToken] - Get shared workspace (public, no auth)
// Supports lookup by both shareToken and workspace ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params;

        // Build the where clause - first try shareToken, then try ID
        const workspaceSelect = {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            // Include user name for display
            user: {
                select: {
                    name: true,
                },
            },
            // Include files
            files: {
                orderBy: { uploadedAt: "desc" as const },
                select: {
                    id: true,
                    filename: true,
                    size: true,
                    uploadedBy: true,
                    uploadedAt: true,
                    fileUrl: true,
                },
            },
            // Include messages
            messages: {
                orderBy: { createdAt: "asc" as const },
                select: {
                    id: true,
                    sender: true,
                    text: true,
                    createdAt: true,
                },
            },
            // Include todos
            todos: {
                orderBy: { createdAt: "desc" as const },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                },
            },
            // Include invoices (only non-draft ones visible to clients)
            invoices: {
                where: { status: { not: "draft" } },
                orderBy: { createdAt: "desc" as const },
                select: {
                    id: true,
                    amount: true,
                    dueDate: true,
                    status: true,
                    createdAt: true,
                    invoiceNumber: true,
                    paymentUrl: true,
                    currency: true,
                },
            },
        };

        // Try to find by shareToken first
        let workspace = await prisma.workspace.findUnique({
            where: { shareToken },
            select: workspaceSelect,
        });

        // If not found by shareToken, try by ID
        if (!workspace) {
            workspace = await prisma.workspace.findUnique({
                where: { id: shareToken },
                select: workspaceSelect,
            });
        }

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            {
                workspace: {
                    ...workspace,
                    freelancerName: workspace.user.name,
                    user: undefined,
                },
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Get shared workspace error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
