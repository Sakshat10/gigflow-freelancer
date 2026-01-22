import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
        return { error: "not_found", workspace: null };
    }

    if (workspace.userId !== userId) {
        return { error: "forbidden", workspace: null };
    }

    return { error: null, workspace };
}

// GET /api/workspaces/[id]/files - Get workspace files
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

        const files = await prisma.file.findMany({
            where: { workspaceId: id },
            orderBy: { uploadedAt: "desc" },
            include: {
                comments: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        return NextResponse.json({ files }, { headers: corsHeaders });
    } catch (error) {
        console.error("Get files error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/workspaces/[id]/files - Upload a file
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

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "uploads", id);
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileExtension = path.extname(file.name);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Generate file URL
        const fileUrl = `/uploads/${id}/${uniqueFilename}`;

        // Save file metadata to database
        const savedFile = await prisma.file.create({
            data: {
                workspaceId: id,
                filename: file.name,
                size: file.size,
                mimeType: file.type || "application/octet-stream",
                uploadedBy: "freelancer",
                fileUrl,
            },
            include: {
                comments: true,
            },
        });

        return NextResponse.json({ file: savedFile }, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error("Upload file error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
