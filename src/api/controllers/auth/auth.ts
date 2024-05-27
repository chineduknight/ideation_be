import { Request, Response, NextFunction } from "express";
import { getSignedJwtToken } from "utils/signToken";
import ErrorResponse from "utils/errorResponse";
import asyncHandler from "api/middleware/async";
import jwt from "jsonwebtoken";
import sendEmail from "utils/Handlebars";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validateEmail } from "utils/validateStringType";
import { User, UserCreationAttributes } from "database/models/user";
import { Op } from "sequelize";
import { JwtPayload } from "utils/signToken";

// Register User
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, url } = req.body;

    const existingEmail = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return next(new ErrorResponse("This email is already taken", 400));
    }

    const existingUserName = await User.findOne({
      where: {
        username: username.toLowerCase(),
      },
    });
    if (existingUserName) {
      return next(new ErrorResponse("This username is already taken", 400));
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
    } as UserCreationAttributes);

    // Generate verification token
    const verificationToken = user.generateVerificationToken();

    // Create verification URL
    const verificationUrl = `${url}?token=${verificationToken}`;

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
        name: username,
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
      await user.destroy();
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = (user: User, statusCode: number, res: Response) => {
  // Create token
  const token = getSignedJwtToken(user.id);

  const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE) * ONE_DAY_IN_MILLISECONDS
    ),
    httpOnly: true,
    sameSite: "none" as const,
    secure: process.env.NODE_ENV !== "development",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: { token },
  });
};

// Verify Email
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    try {
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET!
      ) as JwtPayload;
      const user = await User.findByPk(decoded.id);

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

// Login User
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userNameOrEmail, password } = req.body;

    const dataType = validateEmail(userNameOrEmail) ? "email" : "username";

    // Check for user
    const user = await User.findOne({
      where: { [dataType]: { [Op.iLike]: userNameOrEmail.toLowerCase() } },
    });

    if (!user || !user.password) {
      return next(new ErrorResponse("Invalid credentials", 404));
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
  }
);

// Get Current Logged In User
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByPk(req.query.userId as string);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// Forgot Password
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

// Reset Password
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
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

// Logout User
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
