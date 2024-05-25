import Joi from "joi";

export default class NoteValidator {
  static validate(method: string) {
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
    return Joi.object({
      title: Joi.string().min(3).max(255).required(),
      content: Joi.string().required(),
    });
  }

  static updateNote() {
    return Joi.object({
      title: Joi.string().min(3).max(255).optional(),
      content: Joi.string().optional(),
    });
  }
}
