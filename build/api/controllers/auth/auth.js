"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.getMe = exports.login = exports.verifyEmail = exports.register = void 0;
const errorResponse_1 = __importDefault(require("../../../utils/errorResponse"));
const async_1 = __importDefault(require("../../middleware/async"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Handlebars_1 = __importDefault(require("../../../utils/Handlebars"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const user_1 = __importDefault(require("../../../database/models/user"));
const signToken_1 = require("../../../utils/signToken");
const validateStringType_1 = require("../../../utils/validateStringType");
// Register User
exports.register = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, url } = req.body;
    const existingEmail = yield user_1.default.findOne({
        where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
        return next(new errorResponse_1.default("This email is already taken", 400));
    }
    const existingUserName = yield user_1.default.findOne({
        where: {
            username: username.toLowerCase(),
        },
    });
    if (existingUserName) {
        return next(new errorResponse_1.default("This username is already taken", 400));
    }
    // Create user
    const user = yield user_1.default.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
    });
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    // Create verification URL
    const verificationUrl = `${url}?token=${verificationToken}`;
    // Email message
    const data = {
        to: email,
        from: {
            name: "Chinedu Knight",
            address: "chineduknight@gmail.com",
        },
        template: "verifyEmail",
        subject: "Email Verification",
        context: {
            name: username,
            verificationUrl,
        },
    };
    try {
        yield Handlebars_1.default.send(data);
        res.status(200).json({
            success: true,
            data: "Verification email sent",
        });
    }
    catch (err) {
        console.error(err);
        yield user.destroy();
        return next(new errorResponse_1.default("Email could not be sent", 500));
    }
}));
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = (0, signToken_1.getSignedJwtToken)(user.id);
    const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    const options = {
        expires: new Date(Date.now() +
            Number(process.env.JWT_COOKIE_EXPIRE) * ONE_DAY_IN_MILLISECONDS),
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        data: { token },
    });
};
// Verify Email
exports.verifyEmail = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token) {
        return next(new errorResponse_1.default("Invalid token", 400));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_1.default.findByPk(decoded.id);
        if (!user) {
            return next(new errorResponse_1.default("No user found with this token", 404));
        }
        if (user.isVerified) {
            return res.status(200).json({
                success: true,
                data: "Email is already verified",
            });
        }
        user.isVerified = true;
        yield user.save();
        res.status(200).json({
            success: true,
            data: "Email verified successfully",
        });
    }
    catch (err) {
        return next(new errorResponse_1.default("Invalid token", 400));
    }
}));
// Login User
exports.login = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userNameOrEmail, password } = req.body;
    const dataType = (0, validateStringType_1.validateEmail)(userNameOrEmail) ? "email" : "username";
    // Check for user
    const user = yield user_1.default.findOne({
        where: { [dataType]: { [sequelize_1.Op.iLike]: userNameOrEmail.toLowerCase() } },
    });
    if (!user || !user.password) {
        return next(new errorResponse_1.default("Invalid credentials", 404));
    }
    if (!user.isVerified) {
        return next(new errorResponse_1.default("Please verify your email", 404));
    }
    // Check if password matches
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return next(new errorResponse_1.default("Invalid credentials", 404));
    }
    sendTokenResponse(user, 200, res);
}));
// Get Current Logged In User
exports.getMe = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findByPk(req.query.userId);
    if (!user) {
        return next(new errorResponse_1.default("User not found", 404));
    }
    res.status(200).json({
        success: true,
        data: user,
    });
}));
// Forgot Password
exports.forgotPassword = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, url } = req.body;
    const user = yield user_1.default.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
        return next(new errorResponse_1.default("There is no user with that email", 404));
    }
    const resetToken = user.generateResetPasswordToken();
    yield user.save();
    const resetUrl = `${url}?token=${resetToken}`;
    const data = {
        to: user.email,
        from: {
            name: "Chinedu Knight",
            address: "chineduknight@gmail.com",
        },
        template: "resetPassword",
        subject: "Password reset token",
        context: {
            name: user.username,
            resetUrl,
        },
    };
    try {
        yield Handlebars_1.default.send(data);
        res.status(200).json({
            success: true,
            data: "An email has been sent to your address",
        });
    }
    catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return next(new errorResponse_1.default("Email could not be sent", 500));
    }
}));
// Reset Password
exports.resetPassword = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");
    const user = yield user_1.default.findOne({
        where: {
            resetPasswordToken,
            resetPasswordExpires: {
                [sequelize_1.Op.gt]: Date.now(),
            },
        },
    });
    if (!user) {
        return next(new errorResponse_1.default("Invalid token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    yield user.save();
    sendTokenResponse(user, 200, res);
}));
// Logout User
exports.logout = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        data: {},
    });
}));
