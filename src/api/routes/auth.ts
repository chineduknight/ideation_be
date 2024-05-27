import { protect } from "../middleware/auth";
// import { protect } from "../ api/middleware/auth";
import {
  register,
  verifyEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/auth/auth";
import { Router } from "express";
import AuthValidator from "../controllers/auth/authValidator";
const router = Router();

router.post("/register", AuthValidator.validate("register"), register);
router.post("/login", AuthValidator.validate("login"), login);
router.get("/verifyemail", verifyEmail);
router.get("/me", protect, getMe);
router.post(
  "/forgotpassword",
  AuthValidator.validate("forgotPassword"),
  forgotPassword
);
router.put(
  "/resetpassword/:resettoken",
  AuthValidator.validate("resetPassword"),
  resetPassword
);
router.get("/logout", logout);

export default router;
