import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnAuthorizedError,
} from "../error.js";

export const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
};

export const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  config.api.fileServerHits++;
  next();
};

export const middlewareErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let code;
  let msg = err.message;
  if (err instanceof BadRequestError) {
    code = 400;
  } else if (err instanceof UnAuthorizedError) {
    code = 401;
  } else if (err instanceof ForbiddenError) {
    code = 402;
  } else if (err instanceof NotFoundError) {
    code = 404;
  } else {
    code = 500;
    msg = "Internal Server Error";
  }

  respondWithError(res, code, msg);
  next();
};
