import type { AuthPrincipal } from "../domain/submissions.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPrincipal;
      rawBody?: Buffer;
    }
  }
}

export {};
