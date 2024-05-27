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
exports.authorize = exports.verifyToken = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const async_1 = __importDefault(require("./async"));
const errorResponse_1 = __importDefault(require("../../utils/errorResponse"));
const user_1 = require("../../database/models/user");
// Protect routes
exports.protect = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let token;
    const authToken = (_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
    if (authToken) {
        token = authToken;
    }
    else {
        token = (_c = req === null || req === void 0 ? void 0 : req.cookies) === null || _c === void 0 ? void 0 : _c.token;
    }
    // Make sure token exists
    if (!token) {
        return next(new errorResponse_1.default("Not authorized to access this route", 401));
    }
    try {
        // Verify token
        const jwtSecret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = yield user_1.User.findByPk(decoded.id, {});
        if (!user) {
            return next(new errorResponse_1.default("Not authorized to access this route", 401));
        }
        // Append user to request body or query
        if (req.method === "GET") {
            req.query.userId = decoded.id;
        }
        else {
            req.body.userId = decoded.id;
        }
        next();
    }
    catch (err) {
        return next(new errorResponse_1.default("Not authorized to access this route", 401));
    }
}));
// checks if a user is logged in or not
exports.verifyToken = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        // Make sure token exists
        if (token &&
            token !== "undefined" &&
            token !== "null" &&
            token !== "none") {
            // return next(new ErrorResponse('Not authorized to access this route', 401));
            // Verify token
            const jwtSecret = process.env.JWT_SECRET;
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = yield user_1.User.findByPk(decoded.id);
        }
        next();
    }
    catch (err) {
        return next(new errorResponse_1.default("Token has expired", 401));
    }
}));
// Grant access to specific roles
const authorize = () => {
    return (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(new errorResponse_1.default(`Not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
