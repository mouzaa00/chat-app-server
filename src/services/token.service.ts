import crypto from "crypto";
import ms from "ms";
import { db } from "../db";
import { refreshTokens } from "../db/schema";

export async function saveRefreshToken(userId: string, token: string) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  await db.insert(refreshTokens).values({
    userId,
    token: hash,
    // Token expires after 7 days (hard coded for now)
    expiresAt: new Date(Date.now() + ms("7d")),
  });
}
