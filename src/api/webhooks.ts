import { Request, Response } from "express";
import { upgradeUserToRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
import { UnAuthorizedError } from "../error.js";

export const handlerWebhook = async (req: Request, res: Response) => {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const apiKey = getAPIKey(req);

  if (!apiKey || apiKey !== config.api.polkaKey) {
    throw new UnAuthorizedError("Unauthorized");
  }

  const params: parameters = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const upgraded = await upgradeUserToRed(params.data.userId);
  if (!upgraded) {
    throw new Error("Could not upgrade user");
  }

  res.status(204).send();
};
