import asyncHandler from "api/middleware/async";
import { Request, Response, NextFunction } from "express";
import { Note, NoteCreationAttributes } from "database/models/note";
import ErrorResponse from "utils/errorResponse";

// Helper function to validate user ID
const validateUserId = (userId: any, next: NextFunction) => {
  if (!userId || typeof userId !== "string") {
    return next(new ErrorResponse("User not authenticated", 401));
  }
};

// @desc      Get all notes for a user
// @route     GET /api/v1/notes
// @access    Private
export const getNotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query;
    validateUserId(userId, next);

    const notes = await Note.findAll({ where: { userId: userId as string } });

    res.status(200).json({
      success: true,
      data: notes,
    });
  }
);

// @desc      Get single note
// @route     GET /api/v1/notes/:id
// @access    Private
export const getNote = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query;
    validateUserId(userId, next);

    const note = await Note.findOne({
      where: { id: req.params.id, userId: userId as string },
    });

    if (!note) {
      return next(new ErrorResponse("Note not found", 404));
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  }
);

// @desc      Create new note
// @route     POST /api/v1/notes
// @access    Private
export const createNote = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, title, content } = req.body as NoteCreationAttributes;

    validateUserId(userId, next);

    const note = await Note.create({
      userId,
      title,
      content,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  }
);

// @desc      Update note
// @route     PUT /api/v1/notes/:id
// @access    Private
export const updateNote = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, title, content } = req.body;

    validateUserId(userId, next);

    const note = await Note.findOne({
      where: { id: req.params.id, userId: userId as string },
    });

    if (!note) {
      return next(new ErrorResponse("Note not found", 404));
    }

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  }
);

// @desc      Delete note
// @route     DELETE /api/v1/notes/:id
// @access    Private
export const deleteNote = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;

    validateUserId(userId, next);

    const note = await Note.findOne({
      where: { id: req.params.id, userId: userId as string },
    });

    if (!note) {
      return next(new ErrorResponse("Note not found", 404));
    }

    await note.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
