import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/socket.js";
var dev = process.env.NODE_ENV !== "production";
var hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
var port = parseInt(process.env.PORT || "3000", 10);
var app = next({ dev: dev, hostname: hostname, port: port });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    var httpServer = createServer(function (req, res) {
        var parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });
    // Initialize Socket.io
    initializeSocketServer(httpServer);
    httpServer.listen(port, function () {
        console.log("> Ready on http://".concat(hostname, ":").concat(port));
        console.log("> Socket.io server running");
    });
});
