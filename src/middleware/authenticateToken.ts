import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils";
import { UnauthorizedError } from "../errors";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new UnauthorizedError("No token was provided");
    }

    const { payload } = await verifyJwt(accessToken);
    if (!payload) {
      throw new UnauthorizedError("Expired or invalid token");
    }

    req.user = payload.user as { id: string; name: string; email: string };
    next();
  } catch (error) {
    next(error);
  }
}
