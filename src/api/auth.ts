import { Request, Response } from "express";

import { checkPasswordHash, makeJWT } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnAuthorizedError } from "../error.js";
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./user.js";

type LoginResponse = UserResponse & {
  token: string;
};

export const handlerLogin = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
    expiresIn: number;
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

  if (!params.expiresIn || params.expiresIn > config.jwt.defaultDuration) {
    params.expiresIn = config.jwt.defaultDuration;
  }

  const accessToken = makeJWT(user.id, params.expiresIn, config.jwt.secret);

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: accessToken,
  } satisfies LoginResponse);
};
