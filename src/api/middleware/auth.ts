import jwt from "jsonwebtoken";
import asyncHandler from "./async";
import ErrorResponse from "utils/errorResponse";
import { User } from "database/models/user";
import { JwtPayload } from "utils/signToken";

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authToken = req.headers?.authorization?.split(" ")[1];
  if (authToken) {
    token = authToken;
  } else {
    token = req?.cookies?.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await User.findByPk(decoded.id, {});
    if (!user) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    // Append user to request body or query
    if (req.method === "GET") {
      req.query.userId = decoded.id;
    } else {
      req.body.userId = decoded.id;
    }
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// checks if a user is logged in or not
export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Make sure token exists
    if (
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token !== "none"
    ) {
      // return next(new ErrorResponse('Not authorized to access this route', 401));
      // Verify token
      const jwtSecret = process.env.JWT_SECRET as string;
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      req.user = await User.findByPk(decoded.id);
    }
    next();
  } catch (err) {
    return next(new ErrorResponse("Token has expired", 401));
  }
});

// Grant access to specific roles
export const authorize = () => {
  return (req, res, next) => {
    if (!req.user.isAdmin) {
      return next(
        new ErrorResponse(`Not authorized to access this route`, 403)
      );
    }
    next();
  };
};
