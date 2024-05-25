// src/api/routes/note.ts
import express from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "api/controllers/note/note";
import { protect } from "api/middleware/auth";
import NoteValidator from "api/controllers/note/noteValidator";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getNotes)
  .post(NoteValidator.validate("createNote"), createNote);

router
  .route("/:id")
  .get(getNote)
  .put(NoteValidator.validate("updateNote"), updateNote)
  .delete(deleteNote);
export default router;
