var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma.js";
var io = null;
export function getIO() {
    return io;
}
export function initializeSocketServer(httpServer) {
    var _this = this;
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: ["http://localhost:8080", "http://localhost:3000"],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", function (socket) {
        console.log("New client connected:", socket.id);
        // Join user's personal room for notifications
        socket.on("join-user-room", function (userId) {
            socket.join("user:".concat(userId));
            console.log("User ".concat(userId, " joined their notification room"));
        });
        // Join workspace room for chat
        socket.on("join-workspace", function (workspaceId) {
            socket.join("workspace:".concat(workspaceId));
            console.log("Socket ".concat(socket.id, " joined workspace:").concat(workspaceId));
        });
        // Leave a workspace room
        socket.on("leave-workspace", function (workspaceId) {
            socket.leave("workspace:".concat(workspaceId));
            console.log("Socket ".concat(socket.id, " left workspace:").concat(workspaceId));
        });
        // Handle new message
        socket.on("send-message", function (message) { return __awaiter(_this, void 0, void 0, function () {
            var workspace, notification, notification, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Socket] Message received:", message);
                        // Broadcast to all clients in the workspace room
                        io === null || io === void 0 ? void 0 : io.to("workspace:".concat(message.workspaceId)).emit("new-message", message);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, prisma.workspace.findUnique({
                                where: { id: message.workspaceId },
                                select: { userId: true, name: true },
                            })];
                    case 2:
                        workspace = _a.sent();
                        if (!(workspace && message.sender === "client")) return [3 /*break*/, 4];
                        return [4 /*yield*/, prisma.notification.create({
                                data: {
                                    userId: workspace.userId,
                                    type: "message",
                                    title: "New message from client",
                                    description: message.text.length > 100
                                        ? message.text.substring(0, 100) + "..."
                                        : message.text,
                                    link: "/workspace/".concat(message.workspaceId, "?tab=chat"),
                                    workspaceId: message.workspaceId,
                                },
                            })];
                    case 3:
                        notification = _a.sent();
                        // Emit real-time notification
                        io === null || io === void 0 ? void 0 : io.to("user:".concat(workspace.userId)).emit('notification', notification);
                        return [3 /*break*/, 5];
                    case 4:
                        if (workspace && message.sender === "freelancer") {
                            notification = {
                                id: Date.now().toString(),
                                type: "message",
                                title: "New message from freelancer",
                                description: message.text.length > 100
                                    ? message.text.substring(0, 100) + "..."
                                    : message.text,
                                timestamp: new Date().toISOString(),
                                read: false,
                            };
                            console.log("[Socket] Emitting client-notification to workspace:".concat(message.workspaceId), notification);
                            io === null || io === void 0 ? void 0 : io.to("workspace:".concat(message.workspaceId)).emit("client-notification", notification);
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("Error creating message notification:", error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        // Handle invoice payment notification
        socket.on("invoice-paid", function (data) {
            console.log("Invoice paid:", data);
            // Broadcast to all clients in the workspace room
            io === null || io === void 0 ? void 0 : io.to("workspace:".concat(data.workspaceId)).emit("invoice-paid", data);
        });
        // Handle invoice payment notification
        socket.on("invoice-paid", function (data) {
            console.log("Invoice paid:", data);
            // Broadcast to all clients in the workspace room
            io === null || io === void 0 ? void 0 : io.to("workspace:".concat(data.workspaceId)).emit("invoice-paid", data);
        });
        // Handle task update notification
        socket.on("task-updated", function (data) {
            console.log("Task updated:", data);
            // Broadcast to all clients in the workspace room
            io === null || io === void 0 ? void 0 : io.to("workspace:".concat(data.workspaceId)).emit("task-updated", data);
        });
        socket.on("disconnect", function () {
            console.log("Client disconnected:", socket.id);
        });
    });
    return io;
}
export function getSocketServer() {
    return io;
}
export function emitToWorkspace(workspaceId, event, data) {
    if (io) {
        io.to("workspace:".concat(workspaceId)).emit(event, data);
    }
}
