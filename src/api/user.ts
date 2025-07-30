import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, UnAuthorizedError } from "../error.js";
import { checkPasswordHash, hashPassword, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { NewUser } from "src/db/schema.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export const handlerCreateUser = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
  };
  let params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);
  if (!hashedPassword) {
    throw new Error("Couldn't hash password");
  }

  const user = await createUser({
    email: params.email,
    hashedPassword: hashedPassword,
  });
  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
};
