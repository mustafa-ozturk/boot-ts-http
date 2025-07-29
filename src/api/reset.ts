import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/users.js";
import { UnAuthorizedError } from "../error.js";

export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new UnAuthorizedError(
      `Reset is only allowed in dev environment. Current platform: ${config.api.platform}`
    );
  }
  config.api.fileServerHits = 0;
  await deleteUsers();
  res.end();
}
