"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = require("../models/user");
const note_1 = require("../models/note");
const sequelize = new sequelize_typescript_1.Sequelize({
    storage: ":memory:",
    models: [user_1.User, note_1.Note],
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    logging: false,
});
exports.default = sequelize;
