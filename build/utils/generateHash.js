"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const generateHash = (length = 40) => {
    return crypto_1.default.randomBytes(length).toString("hex");
};
module.exports = generateHash;
