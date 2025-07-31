import { Request, Response } from "express";
import { createUser, getUserByEmail, updateUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, UnAuthorizedError } from "../error.js";
import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  validateJWT,
} from "../auth.js";
import { config } from "../config.js";
import { NewUser } from "../db/schema.js";

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

export const handlerUpdateUser = async (req: Request, res: Response) => {
  type parameters = {
    email: string;
    password: string;
  };
  let accessToken = getBearerToken(req);
  const subject = validateJWT(accessToken, config.jwt.secret);

  let params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await updateUser(subject, params.email, hashedPassword);
  if (!user) {
    throw new Error("couldn't update user");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  } satisfies UserResponse);
};
