import express, { NextFunction, Request, Response } from "express";
import { handlerReadiness } from "./api/readiness.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerMetrics, handlerResetMetrics } from "./api/metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/api/metrics", handlerMetrics);
app.get("/api/reset", handlerResetMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
