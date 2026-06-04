import type { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    ok: false,
    error: `Route not found: ${request.method} ${request.originalUrl}`
  });
};
