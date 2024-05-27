import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import router from "./routes";
import express from "express";
import "colors";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import sequelize from "../database/config/config";
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const whitelist =
  process.env.NODE_ENV === "development"
    ? [/^http:\/\/localhost:\d+$/] // Allows any localhost origin in development mode
    : ["https://knight-noteapp.netlify.app"];
console.log("whitelist:", whitelist);
const corsOptions = {
  origin: function (origin, callback) {
    if (
      whitelist.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
          ? allowedOrigin === origin
          : allowedOrigin.test(origin)
      ) ||
      !origin
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
};

// Enable CORS
app.use(cors(corsOptions));

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use((req, res, next) => {
  if (
    (req.path === "/api/notes" && req.method === "POST") ||
    (req.path.startsWith("/api/notes/") && req.method === "PUT")
  ) {
    // Skip xss-clean for note creation and updating routes
    return next();
  }
  xss()(req, res, next);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

app.get("/", (req, res) => res.send("Express  Server"));
app.use("/api", router);

app.all("*", (req, res) => res.status(404).json({ data: "Route not found" }));

app.use((err, req, res, next) => {
  console.log("Error", err);

  next(err);
  return res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3443;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true }); // For development, use { alter: true } for production
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(
        `⚡️[server]: Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
          .yellow.bold
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

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
