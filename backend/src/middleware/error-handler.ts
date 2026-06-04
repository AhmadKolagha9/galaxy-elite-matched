import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode =
    typeof error?.status === "number" && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    ok: false,
    error: statusCode >= 500 ? "Internal server error" : error.message ?? "Request failed"
  });
};
