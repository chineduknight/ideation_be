import { User } from "database/models/user";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
