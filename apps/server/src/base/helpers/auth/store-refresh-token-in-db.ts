import { eq, desc } from "drizzle-orm";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema";
import bcrypt from "bcryptjs";

interface CreateRefreshTokenParams {
  userId: number;
  token: string;
}

interface CreateRefreshTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export async function storeRefreshTokenInDB({
  userId,
  token,
}: CreateRefreshTokenParams): Promise<CreateRefreshTokenResult> {
  try {
    // Find the latest active refresh token for this user
    const latestToken = await findLatestActiveToken(userId);

    // Rotate the latest token if it exists
    if (latestToken) {
      await rotateExistingToken(latestToken.id);
    }

    // Create new token with active status
    await createNewActiveToken(userId, token);

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error("Error creating refresh token:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

async function findLatestActiveToken(userId: number) {
  return await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.userId, userId),
    orderBy: [desc(refreshTokens.createdAt)],
  });
}

async function rotateExistingToken(tokenId: number): Promise<void> {
  await db
    .update(refreshTokens)
    .set({
      status: "rotated",
    })
    .where(eq(refreshTokens.id, tokenId));
}

async function createNewActiveToken(
  userId: number,
  token: string
): Promise<void> {
  const tokenHash = await hashToken(token);
  const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    familyId,
    status: "active",
    expiresAt,
    createdAt: new Date(),
  });
}

async function hashToken(token: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(token, saltRounds);
}
