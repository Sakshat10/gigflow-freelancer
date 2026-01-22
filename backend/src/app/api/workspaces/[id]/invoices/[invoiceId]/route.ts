import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to verify invoice ownership
async function verifyInvoiceOwnership(invoiceId: string, workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        return { error: "workspace_not_found" };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden" };
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoice || invoice.workspaceId !== workspaceId) {
        return { error: "invoice_not_found" };
    }

    return { error: null, invoice };
}

// PATCH /api/workspaces/[id]/invoices/[invoiceId] - Update an invoice
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; invoiceId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, invoiceId } = await params;
        const { error } = await verifyInvoiceOwnership(invoiceId, id, user.userId);

        if (error === "workspace_not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "invoice_not_found") {
            return NextResponse.json(
                { error: "Invoice not found" },
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
        const { amount, dueDate, status } = body;

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                ...(amount !== undefined && { amount: parseFloat(amount) }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(status && { status }),
            },
        });

        return NextResponse.json({ invoice }, { headers: corsHeaders });
    } catch (error) {
        console.error("Update invoice error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// DELETE /api/workspaces/[id]/invoices/[invoiceId] - Delete an invoice
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; invoiceId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, invoiceId } = await params;
        const { error } = await verifyInvoiceOwnership(invoiceId, id, user.userId);

        if (error === "workspace_not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "invoice_not_found") {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "forbidden") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        await prisma.invoice.delete({
            where: { id: invoiceId },
        });

        return NextResponse.json(
            { message: "Invoice deleted successfully" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Delete invoice error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
