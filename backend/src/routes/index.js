import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import workspacesRouter from "./workspaces.js";
import notificationsRouter from "./notifications.js";
import clientRouter from "./client.js";
import invoicesRouter from "./invoices.js";
import webhookRouter from "./webhook.js";

const router = Router();

// Mount all sub-routers
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/workspaces", workspacesRouter);
router.use("/notifications", notificationsRouter);
router.use("/client", clientRouter);
router.use("/invoices", invoicesRouter);
router.use("/webhooks", webhookRouter);

export default router;
