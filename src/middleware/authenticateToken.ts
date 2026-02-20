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
      res
        .status(401)
        .json({ message: "Unauthenticated, no token was provided" });
      return;
    }

    const { payload } = await verifyJwt(accessToken);
    if (!payload) {
      throw new UnauthorizedError("Unauthenticated, expired or invalid token");
    }

    res.locals.user = payload.user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
