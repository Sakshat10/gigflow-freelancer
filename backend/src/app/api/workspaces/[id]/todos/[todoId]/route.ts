import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to verify todo ownership
async function verifyTodoOwnership(todoId: string, workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        return { error: "workspace_not_found" };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden" };
    }

    const todo = await prisma.todo.findUnique({
        where: { id: todoId },
    });

    if (!todo || todo.workspaceId !== workspaceId) {
        return { error: "todo_not_found" };
    }

    return { error: null, todo };
}

// PATCH /api/workspaces/[id]/todos/[todoId] - Update a todo
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; todoId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, todoId } = await params;
        const { error } = await verifyTodoOwnership(todoId, id, user.userId);

        if (error === "workspace_not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "todo_not_found") {
            return NextResponse.json(
                { error: "Todo not found" },
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
        const { title, status } = body;

        const todo = await prisma.todo.update({
            where: { id: todoId },
            data: {
                ...(title && { title }),
                ...(status && { status }),
            },
        });

        return NextResponse.json({ todo }, { headers: corsHeaders });
    } catch (error) {
        console.error("Update todo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// DELETE /api/workspaces/[id]/todos/[todoId] - Delete a todo
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; todoId: string }> }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { id, todoId } = await params;
        const { error } = await verifyTodoOwnership(todoId, id, user.userId);

        if (error === "workspace_not_found") {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "todo_not_found") {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (error === "forbidden") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: corsHeaders }
            );
        }

        await prisma.todo.delete({
            where: { id: todoId },
        });

        return NextResponse.json(
            { message: "Todo deleted successfully" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Delete todo error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
