"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const note_1 = require("../controllers/note/note");
const auth_1 = require("../middleware/auth");
const noteValidator_1 = __importDefault(require("../controllers/note/noteValidator"));
const router = express_1.default.Router();
router.use(auth_1.protect);
router
    .route("/")
    .get(note_1.getNotes)
    .post(noteValidator_1.default.validate("createNote"), note_1.createNote);
router
    .route("/:id")
    .get(note_1.getNote)
    .put(noteValidator_1.default.validate("updateNote"), note_1.updateNote)
    .delete(note_1.deleteNote);
exports.default = router;
