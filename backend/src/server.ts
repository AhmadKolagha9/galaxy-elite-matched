import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  console.log(`${env.apiName} listening on port ${env.port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}. Closing HTTP server.`);

  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
