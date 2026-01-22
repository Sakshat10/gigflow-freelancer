import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/invoices - Get all invoices for the current user across all workspaces
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Get all invoices from all workspaces owned by the user
        const invoices = await prisma.invoice.findMany({
            where: {
                workspace: {
                    userId: currentUser.userId,
                },
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        clientEmail: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Map to include workspace info in a flat structure
        const mappedInvoices = invoices.map((invoice) => ({
            id: invoice.id,
            workspaceId: invoice.workspaceId,
            workspaceName: invoice.workspace.name,
            clientEmail: invoice.workspace.clientEmail,
            amount: invoice.amount,
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status,
            pdfUrl: invoice.pdfUrl,
            createdAt: invoice.createdAt.toISOString(),
        }));

        return NextResponse.json({ invoices: mappedInvoices }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get all invoices error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
