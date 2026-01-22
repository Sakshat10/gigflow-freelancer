import { PrismaClient } from "@prisma/client";
var globalForPrisma = global;
export var prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
