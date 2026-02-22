import { ConflictError, UnauthorizedError } from "../errors";
import type { LoginBody, RegisterBody } from "../schemas/auth.schema";
import { generateRefreshToken, signJWT, validatePassword } from "../utils";
import { invalidateToken, saveRefreshToken } from "./token.service";
import { createUser, getUserByEmail } from "./user.service";

export async function register(input: RegisterBody) {
  const existingUser = await getUserByEmail(input.email);
  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  const user = await createUser(input);
  if (!user) {
    throw new Error("Something went wrong, try again!");
  }

  const accessToken = await signJWT(
    { id: user.id, name: user.name, email: user.email },
    process.env.ACCESS_TOKEN_TTL!
  );
  const refreshToken = generateRefreshToken();

  await saveRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginBody) {
  const user = await getUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Omitting password field from user, so I don't send it to client
  const { password: candidatePassword, ...userWithoutPassword } = user;

  const valid = await validatePassword(input.password, candidatePassword);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = await signJWT(
    {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
    },
    process.env.ACCESS_TOKEN_TTL!
  );
  const refreshToken = generateRefreshToken();

  await saveRefreshToken(user.id, refreshToken);

  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function logout(userId: string) {
  await invalidateToken(userId);
}
