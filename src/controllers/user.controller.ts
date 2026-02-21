import type { NextFunction, Request, Response } from "express";
import { getUserById } from "../services/user.service";
import { NotFoundError } from "../errors";

export async function getUserProfile(req: Request, res: Response) {
  res.status(200).json({ user: res.locals.user });
}
