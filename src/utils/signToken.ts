import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET as string;
const expiresIn = process.env.JWT_EXPIRE as string;
export const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn,
  });
};
