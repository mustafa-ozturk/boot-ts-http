import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "../error.js";

export const handlerCreateUser = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
  };
  let params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
};
