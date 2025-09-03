import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema";

interface IsRefreshTokenActiveParams {
  token: string;
}

interface IsRefreshTokenActiveResult {
  isActive: boolean;
  userId?: number;
  error?: string;
}

export async function isRefreshTokenActive(
  token: string
): Promise<IsRefreshTokenActiveResult> {
  try {
    const tokenRecord = await findTokenInDatabase(token);

    if (!tokenRecord) {
      return {
        isActive: false,
        error: "Token not found",
      };
    }

    if (isTokenExpired(tokenRecord.expiresAt)) {
      return {
        isActive: false,
        error: "Token expired",
      };
    }

    if (tokenRecord.status !== "active") {
      // If we end up here, it means we got provided revoked token, indicating possibility of theft
      // Thus we will revoke all tokens with same FamilyIds

      return {
        isActive: false,
        error: `Token status is ${tokenRecord.status}`,
      };
    }

    return {
      isActive: true,
      userId: tokenRecord.userId,
    };
  } catch (error) {
    console.error("Error checking refresh token status:", error);
    return {
      isActive: false,
      error: "Internal server error",
    };
  }
}

async function findTokenInDatabase(token: string) {
  // We need to hash the token to compare with stored hash
  // Since we can't reverse the hash, we'll need to check all tokens
  // This is not ideal for performance, but necessary for security
  const allTokens = await db.query.refreshTokens.findMany({
    where: eq(refreshTokens.status, "active"),
  });

  // Find the token by comparing hashes
  for (const tokenRecord of allTokens) {
    const isMatch = await bcrypt.compare(token, tokenRecord.tokenHash);
    if (isMatch) {
      return tokenRecord;
    }
  }

  return null;
}

function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
