import crypto from "crypto";
import { db } from "../db";
import { tokensTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "../errors";
import { generateRefreshToken, signJWT } from "../utils";

export async function saveRefreshToken(userId: string, token: string) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  await db.insert(tokensTable).values({
    userId,
    token: hash,
    // Token expires after 7 days (hard coded for now)
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function invalidateToken(userId: string) {
  await db.delete(tokensTable).where(eq(tokensTable.userId, userId));
}

export async function rotateRefreshToken(incomingToken: string) {
  const hashed = crypto
    .createHash("sha256")
    .update(incomingToken)
    .digest("hex");

  const [result] = await db
    .select({
      user: {
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      },
      refreshtoken: {
        id: tokensTable.id,
        token: tokensTable.token,
        expiresAt: tokensTable.expiresAt,
      },
    })
    .from(tokensTable)
    .where(eq(tokensTable.token, hashed))
    .innerJoin(usersTable, eq(usersTable.id, tokensTable.userId));

  if (!result?.refreshtoken) {
    throw new UnauthorizedError("Invalid token");
  }

  if (result.refreshtoken.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired, please login again");
  }

  // rotate, delete old token, issue new token
  await db
    .delete(tokensTable)
    .where(eq(tokensTable.id, result.refreshtoken.id));

  const accessToken = await signJWT(
    { user: result.user },
    process.env.ACCESS_TOKEN_TTL!
  );
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(result.user.id, refreshToken);

  return { accessToken, refreshToken };
}
