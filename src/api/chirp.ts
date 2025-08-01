import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnAuthorizedError,
} from "../error.js";
import {
  createChirp,
  deleteChirpById,
  getChirpById,
  getChirps,
  getChirpsByUserId,
} from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

const validateChirp = (body: string) => {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  const profanity = ["kerfuffle", "sharbert", "fornax"];

  return cleanTextOfProfanity(body, profanity);
};

const cleanTextOfProfanity = (text: string, profanity: string[]) => {
  const cleanedText = text
    .split(" ")
    .map((word) => {
      if (profanity.includes(word.toLowerCase())) {
        return "****";
      }
      return word;
    })
    .join(" ");

  return cleanedText;
};

export const handlerCreateChirp = async (req: Request, res: Response) => {
  type parameters = {
    body: string;
  };
  let params: parameters = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  if (!params.body) {
    throw new BadRequestError("Missing required fields");
  }

  const cleaned = validateChirp(params.body);

  const chirp = await createChirp({ body: cleaned, userId: userId });

  respondWithJSON(res, 201, chirp);
};

export const handlerGetChirps = async (req: Request, res: Response) => {
  let authorId;
  let authorIdQuery = req.query.authorId;
  // validate it cuz it can contain anything
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }
  let sort: "asc" | "desc" = "asc";
  let sortQuery = req.query.sort;
  if (sortQuery === "desc") {
    sort = sortQuery;
  }

  let chirps;
  if (authorId) {
    chirps = await getChirpsByUserId(authorId, sort);
  } else {
    chirps = await getChirps(sort);
  }
  if (!chirps) {
    throw new Error("Could not get chirps");
  }
  respondWithJSON(res, 200, chirps);
};

export const handlerGetChirpById = async (req: Request, res: Response) => {
  const { chirpId } = req.params;

  if (!chirpId) {
    throw new BadRequestError("Missing required fields");
  }

  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    respondWithError(res, 404, "chirp not found");
    return;
  }

  respondWithJSON(res, 200, chirp);
};

export const handlerDeleteChirpById = async (req: Request, res: Response) => {
  const { chirpID } = req.params;

  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);

  const chirp = await getChirpById(chirpID);
  if (!chirp) {
    throw new NotFoundError("chirp not found");
  }

  if (chirp.userId !== userId) {
    throw new ForbiddenError("You can't delete this chirp");
  }

  const deleted = await deleteChirpById(chirpID);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpId: ${chirpID}`);
  }

  res.status(204).send();
};
