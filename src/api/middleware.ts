import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

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
  config.fileserverHits++;
  next();
};
