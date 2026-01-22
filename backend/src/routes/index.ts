import { Router } from "express";
import authRouter from "./auth";
import userRouter from "./user";
import workspacesRouter from "./workspaces";
import notificationsRouter from "./notifications";
import clientRouter from "./client";
import invoicesRouter from "./invoices";

const router = Router();

// Mount all sub-routers
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/workspaces", workspacesRouter);
router.use("/notifications", notificationsRouter);
router.use("/client", clientRouter);
router.use("/invoices", invoicesRouter);

export default router;
