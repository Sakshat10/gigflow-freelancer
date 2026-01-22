import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notificationHelper";

// CORS headers for public access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// PATCH /api/client/[shareToken]/invoices/[invoiceId]/pay - Mark invoice as paid
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string; invoiceId: string }> }
) {
    try {
        const { shareToken, invoiceId } = await params;

        // Find workspace by share token or ID
        let workspace = await prisma.workspace.findUnique({
            where: { shareToken },
            select: { id: true, userId: true, name: true },
        });

        // If not found by shareToken, try by ID
        if (!workspace) {
            workspace = await prisma.workspace.findUnique({
                where: { id: shareToken },
                select: { id: true, userId: true, name: true },
            });
        }

        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Find the invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice || invoice.workspaceId !== workspace.id) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Update invoice status to paid
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: "paid",
            },
        });

        // Create notification for freelancer
        await createNotification({
            userId: workspace.userId,
            type: "invoice_paid",
            title: "Payment Received!",
            description: `Client paid $${updatedInvoice.amount.toFixed(2)} for ${workspace.name}`,
            link: `/workspace/${workspace.id}?tab=invoices`,
            workspaceId: workspace.id,
        });

        return NextResponse.json(
            {
                message: "Invoice marked as paid",
                invoice: updatedInvoice
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Pay invoice error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
