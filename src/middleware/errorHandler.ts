import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors";

export async function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = "Something went wrong, try again";

  if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message;
  } else if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  res.status(statusCode).json({ error: message });
}
