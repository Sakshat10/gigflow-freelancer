import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getCurrentUser,
    unauthorizedResponse,
    successResponse,
    errorResponse,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const payload = await getCurrentUser(request);

        if (!payload) {
            return unauthorizedResponse();
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                createdAt: true,
            },
        });

        if (!user) {
            return unauthorizedResponse("User not found");
        }

        return successResponse({ user });
    } catch (error) {
        console.error("Get current user error:", error);
        return errorResponse("Internal server error", 500);
    }
}
