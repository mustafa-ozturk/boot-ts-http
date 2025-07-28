import { Response } from "express";

export const respondWithError = (
  res: Response,
  code: number,
  message: string
) => {
  respondWithJSON(res, code, { error: message });
};

export const respondWithJSON = (res: Response, code: number, payload: any) => {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
  res.end();
};
