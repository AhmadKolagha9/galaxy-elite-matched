import { Router } from "express";

import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    ok: true,
    name: env.apiName,
    status: "ok",
    databaseConfigured: Boolean(env.mysqlDatabaseUrl),
    databaseEngine: "mysql",
    firebaseUsage: "notifications_only",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });
});
