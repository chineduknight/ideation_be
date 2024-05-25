// src/database/models/note.ts
import { Model, DataTypes } from "sequelize";
import { sequelize } from ".";
// import sequelize from "../config/sequelize";

class Note extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public content!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Note.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Note",
  }
);

export default Note;
