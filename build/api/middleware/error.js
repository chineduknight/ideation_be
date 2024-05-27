"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = __importDefault(require("../../utils/errorResponse"));
require("colors");
// import sentry from '../../utils/sentry';
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log to console for developer
    if (process.env.NODE_ENV !== "test") {
        // eslint-disable-next-line no-console
        console.log(err.stack);
    }
    //Mongoose bad ObjectID
    if (err.name === "CastError") {
        const message = `Resource not found`;
        error = new errorResponse_1.default(message, 404);
    }
    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new errorResponse_1.default(message, 409);
    }
    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new errorResponse_1.default(message, 400);
    }
    // sequlize validation Error
    if (err.name === "SequelizeUniqueConstraintError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new errorResponse_1.default("A validation error has occured, the value already exists " + message, 400);
    }
    // Invalid UUID sequelize
    if (err.name === "SequelizeDatabaseError") {
        const message = "Invalid Id please check the id, SequelizeDBError";
        error = new errorResponse_1.default(message, 400);
    }
    if (!error.statusCode) {
        error.statusCode = 500;
        // sentry.captureException(err); can send error to sentry
    }
    res.status(error.statusCode).json({
        success: false,
        error: error.message || error.msg || "Server Error",
    });
};
exports.default = errorHandler;
