import { Request, Response } from "express";

import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnAuthorizedError } from "../error.js";
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./user.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export const handlerLogin = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
  };
  let params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UnAuthorizedError("Incorect email or password");
  }

  const pwIsValid = await checkPasswordHash(
    params.password,
    user.hashedPassword
  );

  if (!pwIsValid) {
    throw new UnAuthorizedError("Incorect email or password");
  }

  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );

  const refreshExpiration = new Date();
  refreshExpiration.setDate(refreshExpiration.getDate() + 60);
  const refreshToken = await createRefreshToken({
    token: makeRefreshToken(),
    expiresAt: refreshExpiration,
    userId: user.id,
  });

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: accessToken,
    refreshToken: refreshToken.token,
  } satisfies LoginResponse);
};
