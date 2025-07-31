import { Request, Response } from "express";
import { getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refreshTokens.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { getUserByID } from "../db/queries/users.js";
import { config } from "../config.js";

export const handlerRefresh = async (req: Request, res: Response) => {
  const token = getBearerToken(req);

  const dbToken = await getRefreshToken(token);

  if (!dbToken) {
    respondWithError(res, 401, "Unauthorized");
    return;
  }

  if (dbToken.revokedAt !== null) {
    respondWithError(res, 401, "Unauthorized");
    return;
  }

  if (dbToken.expiresAt < new Date()) {
    respondWithError(res, 401, "Unauthorized");
    return;
  }

  const user = await getUserByID(dbToken.userId);
  if (!user) {
    throw new Error("Couldn't find user");
  }

  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );

  respondWithJSON(res, 200, {
    token: accessToken,
  });
};

export const handlerRevoke = async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  await revokeRefreshToken(token);
  res.status(204).end();
};
