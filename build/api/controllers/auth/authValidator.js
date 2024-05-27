"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AuthValidator {
    static validate(method) {
        return [
            (req, res, next) => {
                const schema = this[method]();
                const { error } = schema.validate(req.body, { abortEarly: false });
                if (error) {
                    return res.status(422).json({
                        error: error.details.map((item) => item.message.replace(/['"]/g, "")),
                    });
                }
                return next();
            },
        ];
    }
    static login() {
        return joi_1.default.object({
            userNameOrEmail: joi_1.default.string().required(),
            password: joi_1.default.string().required(),
        });
    }
    static register() {
        return joi_1.default.object({
            username: joi_1.default.string().min(3).max(30).required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(6).required(),
            url: joi_1.default.string().required(),
        });
    }
    static googleAuth() {
        return joi_1.default.object({
            username: joi_1.default.string().min(3).max(30).required(),
            email: joi_1.default.string().email().required(),
            image: joi_1.default.string(),
        });
    }
    static forgotPassword() {
        return joi_1.default.object({
            userNameOrEmail: joi_1.default.string().required(),
            url: joi_1.default.string().required(),
        });
    }
    static updatePassword() {
        return joi_1.default.object({
            currentPassword: joi_1.default.string().min(6).required(),
            newPassword: joi_1.default.string().min(6).required(),
        });
    }
    static resetPassword() {
        return joi_1.default.object({
            password: joi_1.default.string().min(6).required(),
        });
    }
    static checkUserName() {
        return joi_1.default.object({
            userName: joi_1.default.string().min(3).max(30).required(),
        });
    }
    static checkEmail() {
        return joi_1.default.object({
            email: joi_1.default.string().email().required(),
        });
    }
}
exports.default = AuthValidator;
