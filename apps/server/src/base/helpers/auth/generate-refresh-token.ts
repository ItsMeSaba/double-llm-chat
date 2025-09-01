import jwt from "jsonwebtoken";
import { StringValue } from "ms";

interface RefreshTokenOptions {
  expiresIn?: StringValue;
}

type RefreshTokenPayload = Record<string, any>;

export function generateRefreshToken(
  payload: RefreshTokenPayload,
  options: RefreshTokenOptions = {}
): string | null {
  const { expiresIn = "7d" } = options;

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: expiresIn,
      issuer: "supernova-task",
      audience: "supernova-task-refresh",
    });

    return token;
  } catch (error) {
    console.error("Error creating refresh token:", error);
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as RefreshTokenPayload;

    return decoded;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
}

export function decodeRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.decode(token) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error decoding refresh token:", error);
    return null;
  }
}
