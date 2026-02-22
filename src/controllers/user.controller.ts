import type { Request, Response } from "express";

export async function getUserProfile(req: Request, res: Response) {
  res.status(200).json({ user: req.user });
}
