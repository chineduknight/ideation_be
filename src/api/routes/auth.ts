import { protect } from "api/middleware/auth";
import { register, verifyEmail, login, getMe } from "../controllers/auth/auth";
import { Router } from "express";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verifyemail", verifyEmail);
router.get("/me", protect, getMe);
export default router;
