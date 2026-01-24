import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initializeSocketServer } from "./src/lib/socket.js";
import apiRouter from "./src/routes/index.js";

const app = express();

// 🔥 CORS — SIMPLE, STATIC, SAFE
app.use(
    cors({
        origin: [
            "http://localhost:8080", // Local frontend
            "http://localhost:3000", // Backend port (for testing)
            "https://gigflow-freelancer-dun.vercel.app", // Production frontend
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// 🔥 REQUIRED: OPTIONS preflight
app.options("*", cors());

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => {
    res.status(200).send("GigFlow API is running");
});

// API routes
app.use("/api", apiRouter);

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocketServer(httpServer);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("✓ API running on port", PORT);
});
