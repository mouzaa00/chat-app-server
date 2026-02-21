import type { NextFunction, Request, Response } from "express";
import type { LoginBody, RegisterBody } from "../schemas/auth.schema";
import { login, logout, register } from "../services/auth.service";
import { UnauthorizedError } from "../errors";
import { rotateRefreshToken } from "../services/token.service";

export async function registerHandler(
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // cookie expires after 15 mins
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expires after 7 days
    });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, accessToken, refreshToken } = await login(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // cookie expires after 15 mins
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expires after 7 days
    });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(req: Request, res: Response) {
  await logout(res.locals.user.id);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "User logged out successfully" });
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const incomingToken = req.cookies.refreshToken;
    if (!incomingToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    const { accessToken, refreshToken } =
      await rotateRefreshToken(incomingToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expires after 7 days
    });

    res.status(201).json({ message: "Tokens refreshed" });
  } catch (error) {
    next(error);
  }
}
