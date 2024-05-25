import { Router } from "express";
import auth from "./auth";

const router = Router();

// Mount routers
router.use("/users", auth);

export default router;
