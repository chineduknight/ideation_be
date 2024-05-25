import { UserInstance } from "database/models"; // Adjust the import path as necessary

declare module "express-serve-static-core" {
  interface Request {
    user?: UserInstance; // Add the user property to the Request interface
  }
}
