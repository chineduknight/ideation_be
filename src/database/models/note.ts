import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";

// Define an interface for Note attributes
export interface NoteAttributes {
  id?: string;
  userId: string;
  title: string;
  content: string;
}

// Define an interface for Note creation attributes
export interface NoteCreationAttributes extends Omit<NoteAttributes, "id"> {}

@Table({
  tableName: "Notes",
  timestamps: true,
})
export class Note extends Model<NoteAttributes, NoteCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @BelongsTo(() => User)
  user!: User;
}

export default Note;
