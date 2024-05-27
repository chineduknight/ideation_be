import Joi, { ObjectSchema } from "joi";

type ValidatorMethod =
  | "login"
  | "register"
  | "googleAuth"
  | "forgotPassword"
  | "updatePassword"
  | "resetPassword"
  | "checkUserName"
  | "checkEmail";

export default class AuthValidator {
  static validate(method: ValidatorMethod) {
    return [
      (req, res, next) => {
        const schema: ObjectSchema = this[method]();
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
          return res.status(422).json({
            error: error.details.map((item) =>
              item.message.replace(/['"]/g, "")
            ),
          });
        }
        return next();
      },
    ];
  }

  static login(): ObjectSchema {
    return Joi.object({
      userNameOrEmail: Joi.string().required(),
      password: Joi.string().required(),
    });
  }

  static register(): ObjectSchema {
    return Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      url: Joi.string().required(),
    });
  }

  static googleAuth(): ObjectSchema {
    return Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      image: Joi.string(),
    });
  }

  static forgotPassword(): ObjectSchema {
    return Joi.object({
      email: Joi.string().required(),
      url: Joi.string().required(),
    });
  }

  static updatePassword(): ObjectSchema {
    return Joi.object({
      currentPassword: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required(),
    });
  }

  static resetPassword(): ObjectSchema {
    return Joi.object({
      password: Joi.string().min(6).required(),
    });
  }

  static checkUserName(): ObjectSchema {
    return Joi.object({
      userName: Joi.string().min(3).max(30).required(),
    });
  }

  static checkEmail(): ObjectSchema {
    return Joi.object({
      email: Joi.string().email().required(),
    });
  }
}
