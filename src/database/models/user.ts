import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BeforeSave,
} from "sequelize-typescript";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Note } from "./note";

// Define an interface for User attributes
export interface UserAttributes {
  id?: string;
  username: string;
  email: string;
  password: string;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// Define an interface for User creation attributes
export interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

@Table({
  tableName: "Users",
  timestamps: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isVerified!: boolean;

  @Column(DataType.STRING)
  resetPasswordToken?: string;

  @Column(DataType.DATE)
  resetPasswordExpires?: Date;

  @HasMany(() => Note)
  notes!: Note[];

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  generateVerificationToken(): string {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
  }

  generateResetPasswordToken(): string {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
  }

  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    if (user.changed("username")) {
      user.username = user.username.toLowerCase();
    }
    if (user.changed("email")) {
      user.email = user.email.toLowerCase();
    }
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    // delete values.password;
    return values;
  }
}

export default User;
