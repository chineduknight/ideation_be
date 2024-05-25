"use strict";
import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
module.exports = (sequelize) => {
  class User extends Model {
    validatePassword = async (password) => {
      return await bcrypt.compare(password, this.password);
    };
    generateVerificationToken() {
      const verificationToken = jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      return verificationToken;
    }
    generateResetPasswordToken() {
      const resetToken = crypto.randomBytes(20).toString('hex');

      this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      return resetToken;
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(this, value) {
          this.setDataValue("username", value.toLowerCase());
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(this, value) {
          this.setDataValue("email", value.toLowerCase());
        },
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeSave: async (user) => {
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
        },
      },
    }
  );
  User.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};
