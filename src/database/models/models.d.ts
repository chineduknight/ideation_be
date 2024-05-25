declare module "database/models" {
  import {
    Sequelize as SequelizeType,
    Model,
    BuildOptions,
    DataTypes as DataTypesType,
    Op as OpType,
  } from "sequelize";

  export interface UserAttributes {
    id?: string; // Optional if auto-generated
    username: string;
    email: string;
    password: string;
    isVerified?: boolean; // Optional because it has a default value
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
  }

  export interface UserInstance extends Model<UserAttributes>, UserAttributes {
    validatePassword(password: string): Promise<boolean>;
    generateVerificationToken(): string;
    generateResetPasswordToken(): string;
  }

  export type UserStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): UserInstance;
  };

  export const User: UserStatic;
  export const sequelize: SequelizeType;
  export const Sequelize: typeof SequelizeType;
  export const DataTypes: typeof DataTypesType;
  export const Op: typeof OpType;
}
