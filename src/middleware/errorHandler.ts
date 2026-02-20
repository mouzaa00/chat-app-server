import type { Request, Response, NextFunction } from "express";
import { BadRequestError, ConflictError } from "../errors";

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
  }

  res.status(statusCode).json({ error: message });
}
