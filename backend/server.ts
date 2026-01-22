import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/socket.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
// Use PORT from environment (Render sets this), fallback to 10000 for production, 3000 for dev
const port = parseInt(process.env.PORT || (dev ? "3000" : "10000"), 10);

console.log(`[Server] Starting in ${dev ? "development" : "production"} mode`);
console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Server] PORT from env: ${process.env.PORT}`);
console.log(`[Server] Using port: ${port}`);
console.log(`[Server] Hostname: ${hostname}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    console.log("[Server] Next.js app prepared successfully");

    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        console.log(`[Server] ${req.method} ${req.url}`);
        handle(req, res, parsedUrl);
    });

    // Initialize Socket.io
    initializeSocketServer(httpServer);

    httpServer.listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io server running`);
    });
}).catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
});
