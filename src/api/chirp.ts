import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, UnAuthorizedError } from "../error.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirp.js";
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
  const chirps = await getChirps();
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
    throw new Error("Could not get chirp");
  }

  respondWithJSON(res, 200, chirp);
};
