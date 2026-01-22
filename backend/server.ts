import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initializeSocketServer } from "./src/lib/socket.js";
import apiRouter from "./src/routes/index.js";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "https://gigflow-freelancer-dun.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/", (req, res) => {
    res.send("GigFlow API is running");
});

// API routes
app.use("/api", apiRouter);

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocketServer(httpServer);

// Start server
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✓ Socket.io initialized`);
});
