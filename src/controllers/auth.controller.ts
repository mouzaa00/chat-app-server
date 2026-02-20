import type { NextFunction, Request, Response } from "express";
import { signJWT, verifyJwt } from "../utils";
import { log } from "../logger";
import type { LoginBody, RegisterBody } from "../schemas/auth.schema";
import { login, logout, register } from "../services/auth.service";

const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } = process.env;

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

export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    const { payload } = await verifyJwt(refreshToken);
    if (!payload) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = await signJWT({ id: payload.id }, ACCESS_TOKEN_TTL!);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.json({ message: "token refreshed" });
  } catch (err: any) {
    log.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
}
