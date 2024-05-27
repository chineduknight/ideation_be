"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("express-async-errors");
const routes_1 = __importDefault(require("./routes"));
const express_1 = __importDefault(require("express"));
require("colors");
const helmet_1 = __importDefault(require("helmet"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("../database/config/config"));
const app = (0, express_1.default)();
// Body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const whitelist = process.env.NODE_ENV === "development"
    ? [/^http:\/\/localhost:\d+$/] // Allows any localhost origin in development mode
    : [process.env.REACT_APP_URL];
console.log("process.env.REACT_APP_URL:", process.env.REACT_APP_URL);
console.log("whitelist:", whitelist);
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.some((allowedOrigin) => typeof allowedOrigin === "string"
            ? allowedOrigin === origin
            : allowedOrigin.test(origin)) ||
            !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
};
// Enable CORS
app.use((0, cors_1.default)(corsOptions));
// Set security headers
app.use((0, helmet_1.default)());
// Prevent XSS attacks
app.use((req, res, next) => {
    if ((req.path === "/api/notes" && req.method === "POST") ||
        (req.path.startsWith("/api/notes/") && req.method === "PUT")) {
        // Skip xss-clean for note creation and updating routes
        return next();
    }
    (0, xss_clean_1.default)()(req, res, next);
});
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);
// Prevent http param pollution
app.use((0, hpp_1.default)());
app.get("/", (req, res) => res.send("Express  Server"));
app.use("/api", routes_1.default);
app.all("*", (req, res) => res.status(404).json({ data: "Route not found" }));
app.use((err, req, res, next) => {
    console.log("Error", err);
    next(err);
    return res.status(500).json({ error: err.message });
});
const PORT = process.env.PORT || 3443;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield config_1.default.sync({ alter: true }); // For development, use { alter: true } for production
        console.log("Database synced");
        app.listen(PORT, () => {
            console.log(`⚡️[server]: Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
                .yellow.bold);
        });
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
    }
});
startServer();
// import dotenv from "dotenv";
// dotenv.config();
// import sequelize from '../database/config/config';
// const startServer = async () => {
//   try {
//     await sequelize.sync({ force: true }); // For development, use { alter: true } for production
//     console.log("Database synced");
//     // Start your server here
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };
// startServer();
