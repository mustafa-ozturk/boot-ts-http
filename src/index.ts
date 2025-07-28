import express, { NextFunction, Request, Response } from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./api/middleware.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
