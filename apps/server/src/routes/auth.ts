import { db } from "../db";
import { eq } from "drizzle-orm";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { users } from "../db/schema";
import { refreshTokens } from "../db/schema";
import { doesUserExist } from "../base/helpers/auth/does-user-exist";
import { getHashedPassword } from "../base/helpers/auth/get-hashed-password";
import { generateAccessToken } from "../base/helpers/auth/generate-access-token";
import {
  generateRefreshToken,
  verifyRefreshToken,
} from "../base/helpers/auth/generate-refresh-token";
import {
  isRefreshTokenActive,
  storeRefreshTokenInDB,
} from "../base/helpers/auth";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Check if user exists
  const userExists = await doesUserExist(email);
  if (!userExists) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Fetch user from DB
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.length === 0) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const userRecord = user[0];

  console.log(
    "bcrypt.compare(password, userRecord.passwordHash)",
    await bcrypt.compare(password, userRecord.passwordHash)
  );

  if (!(await bcrypt.compare(password, userRecord.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    email: userRecord.email,
    userId: String(userRecord.id),
  });

  const refreshToken = generateRefreshToken({
    email: userRecord.email,
    userId: String(userRecord.id),
  });

  await storeRefreshTokenInDB({
    userId: userRecord.id,
    token: refreshToken!,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    accessToken,
    user: {
      id: userRecord.id,
      email: userRecord.email,
    },
  });
});

router.post("/register", async (req, res) => {
  const { email, password, repeatPassword } = req.body;

  if (!email || !password || !repeatPassword) {
    return res
      .status(400)
      .json({ error: "Email, password, and repeatPassword are required" });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (await doesUserExist(email)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const hashedPassword = await getHashedPassword(password);

  if (!hashedPassword) {
    return res.status(500).json({ error: "Error hashing password" });
  }

  try {
    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
      })
      .returning();

    console.log("newUser", newUser);

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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return res.status(201).json({ accessToken });
  } catch (err) {
    return res.status(500).json({ error: "Error creating user" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Check if refresh token is active in database
    const tokenCheck = await isRefreshTokenActive(refreshToken);

    console.log("tokenCheck", tokenCheck);
    if (!tokenCheck.isActive) {
      return res.status(403).json({ error: "Refresh token is not active" });
    }

    if (!payload) {
      return res.status(403).json({ error: "Invalid token payload" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      email: payload.email,
      userId: payload.userId,
    });

    const newRefreshToken = generateRefreshToken({
      email: payload.email,
      userId: payload.userId,
    });

    // Store new refresh token and remove old one
    await storeRefreshTokenInDB({
      userId: payload.userId,
      token: newRefreshToken!,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(500).json({ error: "Could not refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      // No refresh token to invalidate, but still clear the cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return res.status(200).json({ message: "Logged out successfully" });
    }

    // Check if the refresh token exists and is active
    const tokenCheck = await isRefreshTokenActive(refreshToken);

    if (tokenCheck.isActive && tokenCheck.userId) {
      // Mark the refresh token as revoked in the database
      await db
        .update(refreshTokens)
        .set({
          status: "revoked",
        })
        .where(eq(refreshTokens.userId, tokenCheck.userId));
    }

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    return res.status(500).json({ error: "Error during logout" });
  }
});

export { router as authRoutes };
