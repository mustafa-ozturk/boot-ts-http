import { Request, Response } from "express";
import { upgradeUserToRed } from "../db/queries/users.js";

export const handlerWebhook = async (req: Request, res: Response) => {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

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
