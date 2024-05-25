import { Request, Response, NextFunction } from "express";
import { getSignedJwtToken } from "../../../utils/signToken";
import ErrorResponse from "../../../utils/errorResponse";
import asyncHandler from "../../middleware/async";
import * as Model from "../../../database/models";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utils/Handlebars";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validateEmail } from "utils/validateStringType";
const {
  User,
  Sequelize: { Op },
} = Model;
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, password } = req.body;

    const existingEmail = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return next(new ErrorResponse("This email already taken,", 400));
    }

    const existingUserName = await User.findOne({
      where: {
        username: userName.toLowerCase(),
      },
    });
    if (existingUserName) {
      return next(new ErrorResponse("This username already taken", 400));
    }

    // Create user
    const user = await User.create({
      username: userName.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
    });
    // Generate verification token
    const verificationToken = user.generateVerificationToken();

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verifyemail?token=${verificationToken}`;

    // Email message
    const data = {
      to: email,
      from: {
        name: "Chinedu Knight",
        address: "chineduknight@gmail.com",
      },
      template: "verifyEmail",
      subject: "Email Verification",
      context: {
        name: userName,
        verificationUrl,
      },
    };

    try {
      await sendEmail.send(data);

      res.status(200).json({
        success: true,
        data: "Verification email sent",
      });
    } catch (err) {
      console.error(err);
      user.destroy();
      return next(new ErrorResponse("Email could not be sent", 500));
    }

    // send email
    res.status(200).json({
      success: true,
      data: "Email should be sent here" + user,
    });
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  user.lastLoginAt = new Date();
  user.save();
  // Create token
  const token = getSignedJwtToken(user.id);

  const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE) * ONE_DAY_IN_MILLISECONDS
    ),
    httpOnly: true,
    // this video explians the use of strict
    //https://www.youtube.com/watch?v=aUF2QCEudPo
    // sameSite: 'strict',
    sameSite: "none",
    secure: true,
  };
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "staging"
  ) {
    options["secure"] = true; // set this to false temporarily
  }
  if (process.env.NODE_ENV === "development" && res.frompostman) {
    options["secure"] = false;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: { token },
  });
};

// @desc      Verify email
// @route     GET /api/v1/auth/verifyemail
// @access    Public
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);

      const user = await User.findByPk((decoded as any).id);

      if (!user) {
        return next(new ErrorResponse("No user found with this token", 404));
      }

      if (user.isVerified) {
        return res.status(200).json({
          success: true,
          data: "Email is already verified",
        });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({
        success: true,
        data: "Email verified successfully",
      });
    } catch (err) {
      return next(new ErrorResponse("Invalid token", 400));
    }
  }
);

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = asyncHandler(async (req, res, next) => {
  const { userNameOrEmail, password } = req.body;
  res.frompostman = req.headers.frompostman;
  const dataType = validateEmail(userNameOrEmail) ? "email" : "username";
  // Check for user
  const user = await User.findOne({
    where: { [dataType]: { [Op.iLike]: userNameOrEmail.toLowerCase() } },
    attributes: ["password", "id", "email", "username"],
  });

  if (!user || !user.password) {
    return next(new ErrorResponse("Invalid credentials..", 404));
  }
  if (!user.isVerified) {
    return next(new ErrorResponse("Please verify your email", 404));
  }
  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 404));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {});
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Starts password reset process
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const data = {
      to: user.email,
      from: {
        name: "Chinedu Knight",
        address: "chineduknight@gmail.com",
      },
      template: "resetPassword",
      subject: "Password reset token",
      context: {
        name: user.username,
        resetUrl,
      },
    };

    try {
      await sendEmail.send(data);

      res.status(200).json({
        success: true,
        data: "An email has been sent to your address",
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }
);

// @desc      Resets password
// @route     PUT /api/v1/auth/resetPassword
// @access    Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

// @desc     Logout User
// @route     GET /api/v1/auth/logout
// @access    Public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds in the past
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
