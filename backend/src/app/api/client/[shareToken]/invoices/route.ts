import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers for public access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/client/[shareToken]/invoices - Get invoices (read-only, public)
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
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Only return non-draft invoices to clients
        const invoices = await prisma.invoice.findMany({
            where: {
                workspaceId: workspace.id,
                status: { not: "draft" }, // Hide drafts from clients
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ invoices }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get client invoices error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Note: POST, PATCH, DELETE are NOT implemented for client
// Clients can only VIEW invoices, not modify them

