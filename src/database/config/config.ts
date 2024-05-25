import { Sequelize } from "sequelize-typescript";
import { User } from "database/models/user";
import { Note } from "../models/note";
const sequelize = new Sequelize({
  storage: ":memory:",
  models: [User, Note],
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: "postgres",
  logging: false,
});

export default sequelize;
