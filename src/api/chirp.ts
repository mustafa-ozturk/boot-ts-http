import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "../error.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirp.js";

const cleanTextOfProfanity = (text: string) => {
  const profanity = ["kerfuffle", "sharbert", "fornax"];

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
    userId: string;
  };
  let params: parameters = req.body;

  if (!params.body || !params.userId) {
    throw new BadRequestError("Missing required fields");
  }

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const cleanedBody = cleanTextOfProfanity(params.body);

  const chirp = await createChirp({ body: cleanedBody, userId: params.userId });

  if (!chirp) {
    throw new Error("Could not create chirp");
  }

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
