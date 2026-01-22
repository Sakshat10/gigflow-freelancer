import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// PATCH /api/notifications/[id]/read - Mark specific notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notification = await prisma.notification.findUnique({
            where: { id: params.id },
        });

        if (!notification || notification.userId !== user.userId) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        const updated = await prisma.notification.update({
            where: { id: params.id },
            data: { read: true },
        });

        return NextResponse.json(updated, { headers: corsHeaders });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500, headers: corsHeaders });
    }
}
