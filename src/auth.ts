import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnAuthorizedError } from "./error.js";
import { Request } from "express";

const TOKEN_ISSUER = "chirpy";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 1);
};

export const checkPasswordHash = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const makeJWT = (
  userID: string,
  expiresIn: number,
  secret: string
): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" }
  );
  return token;
};

export const validateJWT = (tokenString: string, secret: string): string => {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnAuthorizedError("Invalid Token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UnAuthorizedError("Invalid Issuer");
  }

  if (!decoded.sub) {
    throw new UnAuthorizedError("No User ID in Token");
  }

  return decoded.sub;
};

export const getBearerToken = (req: Request): string => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError("Malformed authorization header");
  }
  return extractBearerToken(authHeader);
};

export const extractBearerToken = (header: string) => {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError("Malformed authorization header");
  }
  return splitAuth[1];
};

export const makeRefreshToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
