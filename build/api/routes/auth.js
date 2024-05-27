"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
// import { protect } from "../ api/middleware/auth";
const auth_2 = require("../controllers/auth/auth");
const express_1 = require("express");
const authValidator_1 = __importDefault(require("../controllers/auth/authValidator"));
const router = (0, express_1.Router)();
router.post("/register", authValidator_1.default.validate("register"), auth_2.register);
router.post("/login", authValidator_1.default.validate("login"), auth_2.login);
router.get("/verifyemail", auth_2.verifyEmail);
router.get("/me", auth_1.protect, auth_2.getMe);
router.post("/forgotpassword", authValidator_1.default.validate("forgotPassword"), auth_2.forgotPassword);
router.put("/resetpassword/:resettoken", authValidator_1.default.validate("resetPassword"), auth_2.resetPassword);
router.get("/logout", auth_2.logout);
exports.default = router;
