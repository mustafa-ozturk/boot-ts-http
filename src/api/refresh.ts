import { Request, Response } from "express";
import { getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
  userForRefreshToken,
} from "../db/queries/refresh.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { config } from "../config.js";
import { UnAuthorizedError } from "../error.js";

export const handlerRefresh = async (req: Request, res: Response) => {
  const refreshToken = getBearerToken(req);

  const result = await userForRefreshToken(refreshToken);
  if (!result) {
    throw new UnAuthorizedError("invalid refresh token");
  }

  const user = result.user;
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );

  type response = {
    token: string;
  };

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies response);
};

export const handlerRevoke = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  await revokeRefreshToken(token);
  res.status(204).send();
};
