import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createUser() {
    try {
        const email = "test@example.com";
        const password = "password123";
        const name = "Test User";

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("❌ User already exists with this email");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                plan: "free",
            },
        });

        console.log("✅ User created successfully:");
        console.log({
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("❌ Error creating user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
