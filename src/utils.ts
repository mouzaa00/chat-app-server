import bcrypt from "bcrypt";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { log } from "./logger";
import crypto from "crypto";

export async function validatePassword(
  password: string,
  candidatePassword: string
) {
  return await bcrypt.compare(password, candidatePassword);
}

export async function signJWT(
  payload: { id: string; email: string; name: string },
  timeToLive: string
) {
  const alg = "RS256";
  const pkcs8 = process.env.PRIVATE_KEY as string;

  const privateKey = await importPKCS8(pkcs8, alg);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(timeToLive)
    .sign(privateKey);
}

export async function verifyJwt(jwt: string) {
  const alg = "RS256";
  const spki = process.env.PUBLIC_KEY as string;

  const publicKey = await importSPKI(spki, alg);

  try {
    return await jwtVerify(jwt, publicKey);
  } catch (err) {
    if (err instanceof Error) {
      log.error(err.message);
    }
    return {
      payload: null,
    };
  }
}

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function formatName(name: string) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
