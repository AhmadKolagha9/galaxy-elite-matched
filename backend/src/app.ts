import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ credentials: true, origin: env.corsOrigin }));
  app.use(express.json({ limit: "2mb", verify: (request, _response, buffer) => { (request as express.Request).rawBody = Buffer.from(buffer); } }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  app.get("/", (_request, response) => {
    response.json({
      ok: true,
      name: env.apiName,
      status: "ok"
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
