import crypto from "crypto";

const generateHash = (length = 40) => {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = generateHash;
