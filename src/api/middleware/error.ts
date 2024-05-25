import ErrorResponse from "../../utils/errorResponse";
import "colors"
import sentry from 'utils/sentry'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for developer
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.log(err.stack);
  }

  //Mongoose bad ObjectID
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 409);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value: any) => value.message);
    error = new ErrorResponse(message, 400);
  }
  // sequlize validation Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = Object.values(err.errors).map((value: any) => value.message);
    error = new ErrorResponse("A validation error has occured, the value already exists " + message, 400);
  }
  // Invalid UUID sequelize
  if (err.name === "SequelizeDatabaseError") {
    const message = "Invalid Id please check the id, SequelizeDBError"
    error = new ErrorResponse(message, 400);
  }

  if (!error.statusCode) {
    error.statusCode = 500
    sentry.captureException(err);
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message || error.msg || "Server Error",
  });
};

export default errorHandler;
