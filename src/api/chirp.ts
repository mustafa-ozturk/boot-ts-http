import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "../error.js";

export const handlerValidateChirp = (req: Request, res: Response) => {
  type parameters = {
    body: string;
  };
  let params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const profanity = ["kerfuffle", "sharbert", "fornax"];

  const cleanedText = params.body
    .split(" ")
    .map((word) => {
      if (profanity.includes(word.toLowerCase())) {
        return "****";
      }
      return word;
    })
    .join(" ");

  respondWithJSON(res, 200, {
    cleanedBody: cleanedText,
  });
};
