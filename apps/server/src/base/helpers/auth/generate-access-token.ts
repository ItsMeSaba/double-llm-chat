import jwt from "jsonwebtoken";
import { StringValue } from "ms";

interface AccessTokenPayload {
  userId: string;
  email: string;
  role?: string;
}

interface AccessTokenOptions {
  expiresIn?: StringValue;
}

export function generateAccessToken(
  payload: AccessTokenPayload,
  options: AccessTokenOptions = {}
): string | null {
  const { expiresIn = "15m" } = options;

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn,
      issuer: "supernova-task",
      audience: "supernova-task-users",
    });

    return token;
  } catch (error) {
    console.error("Error creating access token:", error);
    return null;
  }
}

export function verifyAccessToken(
  token: string,
  secret: string
): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying access token:", error);
    return null;
  }
}
