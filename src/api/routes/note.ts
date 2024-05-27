import express from "express";
import {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note/note";
import { protect } from "../middleware/auth";
import NoteValidator from "../controllers/note/noteValidator";

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
