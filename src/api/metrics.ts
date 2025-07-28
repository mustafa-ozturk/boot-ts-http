import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
  res.send(`Hits: ${config.fileserverHits}`);
  res.end();
}

export async function handlerResetMetrics(_: Request, res: Response) {
  config.fileserverHits = 0;
  res.end();
}
