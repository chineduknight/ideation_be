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
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const async_1 = __importDefault(require("../../middleware/async"));
const note_1 = require("../../../database/models/note");
const errorResponse_1 = __importDefault(require("../../../utils/errorResponse"));
// Helper function to validate user ID
const validateUserId = (userId, next) => {
    if (!userId || typeof userId !== "string") {
        return next(new errorResponse_1.default("User not authenticated", 401));
    }
};
// @desc      Get all notes for a user
// @route     GET /api/v1/notes
// @access    Private
exports.getNotes = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    validateUserId(userId, next);
    const notes = yield note_1.Note.findAll({ where: { userId: userId } });
    res.status(200).json({
        success: true,
        data: notes,
    });
}));
// @desc      Get single note
// @route     GET /api/v1/notes/:id
// @access    Private
exports.getNote = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    validateUserId(userId, next);
    const note = yield note_1.Note.findOne({
        where: { id: req.params.id, userId: userId },
    });
    if (!note) {
        return next(new errorResponse_1.default("Note not found", 404));
    }
    res.status(200).json({
        success: true,
        data: note,
    });
}));
// @desc      Create new note
// @route     POST /api/v1/notes
// @access    Private
exports.createNote = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, content } = req.body;
    validateUserId(userId, next);
    const note = yield note_1.Note.create({
        userId,
        title,
        content,
    });
    res.status(201).json({
        success: true,
        data: note,
    });
}));
// @desc      Update note
// @route     PUT /api/v1/notes/:id
// @access    Private
exports.updateNote = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, content } = req.body;
    validateUserId(userId, next);
    const note = yield note_1.Note.findOne({
        where: { id: req.params.id, userId: userId },
    });
    if (!note) {
        return next(new errorResponse_1.default("Note not found", 404));
    }
    note.title = title || note.title;
    note.content = content || note.content;
    yield note.save();
    res.status(200).json({
        success: true,
        data: note,
    });
}));
// @desc      Delete note
// @route     DELETE /api/v1/notes/:id
// @access    Private
exports.deleteNote = (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    validateUserId(userId, next);
    const note = yield note_1.Note.findOne({
        where: { id: req.params.id, userId: userId },
    });
    if (!note) {
        return next(new errorResponse_1.default("Note not found", 404));
    }
    yield note.destroy();
    res.status(200).json({
        success: true,
        data: {},
    });
}));
