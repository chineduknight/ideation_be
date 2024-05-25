import asyncHandler from "api/middleware/async";
import { UserInstance } from "database/models";
import Note from "database/models/note";
import { Request, Response, NextFunction } from "express";
import ErrorResponse from "utils/errorResponse";

interface RequestWithUser extends Request {
  user: UserInstance;
}
// @desc      Get all notes for a user
// @route     GET /api/v1/notes
// @access    Private
export const getNotes = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const notes = await Note.findAll({ where: { userId: req.user.id } });

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
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
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
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
      userId: req.user.id,
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
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!note) {
      return next(new ErrorResponse("Note not found", 404));
    }

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
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
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user?.id },
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
