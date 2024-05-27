"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const note_1 = __importDefault(require("./note"));
const router = (0, express_1.Router)();
// Mount routers
router.use("/users", auth_1.default);
router.use("/notes", note_1.default);
exports.default = router;
