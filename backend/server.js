import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { createServer } from "http";
import { initializeSocketServer } from "./src/lib/socket.js";
import apiRouter from "./src/routes/index.js";
import { globalLimiter, attachUserToRequest } from "./src/middleware/rate-limiter.js";
import { sanitizeBody } from "./src/middleware/input-sanitizer.js";

const app = express();

// 🔒 Security Headers - Apply Helmet first
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI frameworks
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for cross-origin resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// 🔥 CORS Configuration
const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://gigflow-freelancer-dun.vercel.app",
];

// Add production frontend URL from environment variable
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`Blocked CORS request from origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400, // 24 hours
    })
);

// 🔥 REQUIRED: OPTIONS preflight
app.options("*", cors());

// Body parsing with size limits
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 🔒 Global rate limiting
app.use(globalLimiter);

// 🔒 Attach user to request for rate limiting
app.use(attachUserToRequest);

// 🔒 Input sanitization middleware
app.use(sanitizeBody);

// Health check (before API routes to avoid rate limiting)
app.get("/", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "GigFlow API is running",
        version: "1.0.0"
    });
});

// API routes
app.use("/api", apiRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocketServer(httpServer);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("✓ API running on port", PORT);
    console.log("✓ Security headers enabled");
    console.log("✓ Rate limiting active");
    console.log("✓ CORS configured for:", allowedOrigins.join(", "));
});
