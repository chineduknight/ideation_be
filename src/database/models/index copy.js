import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import envConfigs from "../config/config";
import initUserModel from "./user.js"; // Import the User model initialization function
import { UserAttributes, UserInstance } from ".";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = envConfigs[env];
const db = {};

let sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Initialize the User model
db.User = initUserModel(sequelize);

// Dynamically import other models if any
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(async (file) => {
    if (file !== "User.js") {
      // Skip User.js since it's already imported
      const model = (await import(path.join(__dirname, file))).default(
        sequelize,
        Sequelize.DataTypes
      );
      db[model.name] = model;
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Sequelize.Op; // Add Op to the export

export default db;
export { sequelize, Sequelize, Op, User, UserAttributes, UserInstance };
