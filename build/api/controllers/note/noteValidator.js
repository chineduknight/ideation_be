"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class NoteValidator {
    static validate(method) {
        return (req, res, next) => {
            const schema = this[method]();
            const { error } = schema.validate(req.body, { abortEarly: false });
            if (error) {
                return res.status(422).json({
                    error: error.details.map((item) => item.message.replace(/['"]/g, "")),
                });
            }
            return next();
        };
    }
    static createNote() {
        return joi_1.default.object({
            title: joi_1.default.string().min(3).max(255).required(),
            content: joi_1.default.string().required(),
            userId: joi_1.default.string().required(),
        });
    }
    static updateNote() {
        return joi_1.default.object({
            title: joi_1.default.string().min(3).max(255).optional(),
            content: joi_1.default.string().optional(),
            userId: joi_1.default.string().required(),
        });
    }
}
exports.default = NoteValidator;
