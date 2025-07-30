import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { UnAuthorizedError } from "./error";

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
