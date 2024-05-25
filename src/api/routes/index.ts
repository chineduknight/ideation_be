import { Router } from "express";
import authRoutes from "./auth";
import noteRoutes from "./note";

const router = Router();

// Mount routers
router.use("/users", authRoutes);
router.use("/notes", noteRoutes);

export default router;
