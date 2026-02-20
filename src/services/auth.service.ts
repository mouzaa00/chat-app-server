import { RegisterBody } from "../schemas/auth.schema";
import { generateRefreshToken, signJWT } from "../utils";
import { saveRefreshToken } from "./token.service";
import { createUser, getUserByEmail } from "./user.service";

export async function register(input: RegisterBody) {
  const existingUser = await getUserByEmail(input.email);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = await createUser(input);
  if (!user) {
    throw new Error("Something went wrong, try again!");
  }

  const accessToken = await signJWT(user, process.env.ACCESS_TOKEN_TTL!);
  const refreshToken = generateRefreshToken();

  await saveRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
}
