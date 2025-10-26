import {
  createAccessToken,
  verifyRefreshToken,
  generateRefreshToken,
  storeRefreshTokenInDB,
  isRefreshTokenActive,
} from "../../base/helpers/auth";
import { getHashedPassword } from "../../base/helpers/auth/get-hashed-password";
import { doesUserExist } from "../../base/helpers/auth/does-user-exist";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../../db";

import bcrypt from "bcryptjs";

export const login = async (email: string, password: string) => {
  const userExists = await doesUserExist(email);

  if (!userExists) {
    return { status: 401, data: { error: "Invalid email or password" } };
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user || user.length === 0) {
    return { status: 401, data: { error: "Invalid email or password" } };
  }

  const userRecord = user[0];

  if (!(await bcrypt.compare(password, userRecord.passwordHash))) {
    return { status: 401, data: { error: "Invalid email or password" } };
  }

  const accessToken = createAccessToken({
    email: userRecord.email,
    userId: String(userRecord.id),
  });

  const refreshToken = generateRefreshToken({
    email: userRecord.email,
    userId: String(userRecord.id),
  });

  await storeRefreshTokenInDB({ userId: userRecord.id, token: refreshToken! });

  return {
    status: 200,
    data: {
      accessToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
      },
    },
  };
};

export const register = async (
  email: string,
  password: string,
  repeatPassword: string
) => {
  if (password !== repeatPassword) {
    return { status: 400, data: { error: "Passwords do not match" } };
  }

  if (await doesUserExist(email)) {
    return { status: 409, data: { error: "Email already exists" } };
  }

  const hashedPassword = await getHashedPassword(password);
  if (!hashedPassword) {
    return { status: 500, data: { error: "Error hashing password" } };
  }

  try {
    const newUser = await db
      .insert(users)
      .values({ email, passwordHash: hashedPassword })
      .returning();
    const accessToken = createAccessToken({
      email,
      userId: String(newUser[0].id),
    });
    const refreshToken = generateRefreshToken({
      email,
      userId: String(newUser[0].id),
    });

    await storeRefreshTokenInDB({
      userId: newUser[0].id,
      token: refreshToken!,
    });

    return { status: 201, data: { accessToken } };
  } catch (error) {
    return { status: 500, data: { error: "Error creating user" } };
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return { status: 403, data: { error: "Invalid refresh token" } };
    }

    const tokenCheck = await isRefreshTokenActive(refreshToken);

    if (!tokenCheck.isActive) {
      return { status: 403, data: { error: "Refresh token is not active" } };
    }

    const newAccessToken = createAccessToken({
      email: payload.email,
      userId: payload.userId,
    });

    const newRefreshToken = generateRefreshToken({
      email: payload.email,
      userId: payload.userId,
    });

    await storeRefreshTokenInDB({
      userId: payload.userId,
      token: newRefreshToken!,
      keepFamilyId: true,
    });

    return {
      status: 200,
      data: { accessToken: newAccessToken },
    };
  } catch (error) {
    return { status: 500, data: { error: "Could not refresh token" } };
  }
};
