import crypto from "crypto";
import { db } from "../db";
import { refreshTokens } from "../db/schema";
import { eq } from "drizzle-orm";

export async function saveRefreshToken(userId: string, token: string) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  await db.insert(refreshTokens).values({
    userId,
    token: hash,
    // Token expires after 7 days (hard coded for now)
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function invalidateToken(userId: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}
