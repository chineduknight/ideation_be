"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRE;
const getSignedJwtToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, jwtSecret, {
        expiresIn,
    });
};
exports.getSignedJwtToken = getSignedJwtToken;
