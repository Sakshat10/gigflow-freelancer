import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initializeSocketServer } from "./src/lib/socket.js";
import apiRouter from "./src/routes/index.js";

const app = express();

// ✅ CORS MUST BE FIRST
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://gigflow-freelancer-dun.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ REQUIRED: Preflight support
app.options("*", cors());

// ✅ Body & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Health check (NOT under /api)
app.get("/", (_req, res) => {
    res.status(200).send("GigFlow API is running");
});

// ✅ API routes
app.use("/api", apiRouter);

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocketServer(httpServer);

// Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ API running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});
