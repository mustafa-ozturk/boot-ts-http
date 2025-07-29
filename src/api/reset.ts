import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerResetMetrics(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  res.end();
}
