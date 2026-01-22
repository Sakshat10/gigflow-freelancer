import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/cors";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50, // Limit to 50 most recent
        });

        return NextResponse.json(notifications, { headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500, headers: corsHeaders });
    }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: {
                userId: user.userId,
                read: false,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500, headers: corsHeaders });
    }
}

// DELETE /api/notifications - Delete all user's notifications
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
        }

        await prisma.notification.deleteMany({
            where: {
                userId: user.userId,
            },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error deleting notifications:", error);
        return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500, headers: corsHeaders });
    }
}
