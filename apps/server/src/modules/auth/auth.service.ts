import { db } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema";
import { doesUserExist } from "../../base/helpers/auth/does-user-exist";
import { getHashedPassword } from "../../base/helpers/auth/get-hashed-password";
import { generateAccessToken } from "../../base/helpers/auth/generate-access-token";
import {
  generateRefreshToken,
  storeRefreshTokenInDB,
} from "../../base/helpers/auth";

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

  const accessToken = generateAccessToken({
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
    const accessToken = generateAccessToken({
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
