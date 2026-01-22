// CORS configuration for API routes
// In production, update FRONTEND_URL environment variable

const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL, // Add your Vercel URL here via env var
].filter(Boolean);

export const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export function getCorsHeaders(origin?: string | null): Record<string, string> {
    // If origin is in allowed list, return it; otherwise return default
    if (origin && allowedOrigins.includes(origin)) {
        return {
            ...corsHeaders,
            "Access-Control-Allow-Origin": origin,
        };
    }
    return corsHeaders;
}
