import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to verify workspace ownership
async function verifyWorkspaceOwnership(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        return { error: "not_found" };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden" };
    }

    return { error: null };
}

// GET /api/workspaces/[id]/invoices - Get workspace invoices
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id } = await params;
        const { error } = await verifyWorkspaceOwnership(id, user.userId);

        if (error === "not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "forbidden") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id },
            select: { name: true },
        });

        const invoices = await prisma.invoice.findMany({
            where: { workspaceId: id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            invoices,
            workspaceName: workspace?.name || "Client"
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get invoices error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/workspaces/[id]/invoices - Create invoice
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id } = await params;
        const { error } = await verifyWorkspaceOwnership(id, user.userId);

        if (error === "not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
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
        const { amount, dueDate, status, currency = "USD" } = body;

        if (!amount || !dueDate) {
            return NextResponse.json(
                { error: "Amount and due date are required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Get user data for invoice number generation and PayPal.Me URL
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                invoiceCounter: true,
                paypalMeUsername: true,
                name: true
            },
        });

        if (!userData) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Check if PayPal.me username is set - required for invoice creation
        if (!userData.paypalMeUsername) {
            return NextResponse.json(
                { error: "PayPal.me link is required to create invoices. Please set up your PayPal.me username in Settings → Pricing Settings before creating invoices." },
                { status: 400, headers: corsHeaders }
            );
        }

        // Increment invoice counter atomically
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { invoiceCounter: { increment: 1 } },
            select: { invoiceCounter: true },
        });

        // Generate invoice number: GF-{USER_SHORT_ID}-{SEQUENCE}
        // Use first 3 chars of user ID (uppercased) as short ID
        const shortId = userData.id.substring(0, 3).toUpperCase();
        const sequenceNumber = String(updatedUser.invoiceCounter).padStart(4, "0");
        const invoiceNumber = `GF-${shortId}-${sequenceNumber}`;

        // Generate PayPal.Me payment URL if username is set
        let paymentUrl: string | null = null;
        if (userData.paypalMeUsername) {
            const parsedAmount = parseFloat(amount);
            paymentUrl = `https://www.paypal.me/${userData.paypalMeUsername}/${parsedAmount}?currencyCode=${currency}`;
        }

        const invoice = await prisma.invoice.create({
            data: {
                workspaceId: id,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                status: status || "draft",
                invoiceNumber,
                paymentUrl,
                currency,
            },
        });

        return NextResponse.json({ invoice }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Create invoice error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

