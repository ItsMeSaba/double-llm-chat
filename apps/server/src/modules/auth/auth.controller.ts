// Placeholder content for authentication controller

import { Request, Response } from "express";
import { login, register } from "./auth.service";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = await login(email, password);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, repeatPassword } = req.body;
    if (!email || !password || !repeatPassword) {
      return res.status(400).json({ error: "Email, password, and repeatPassword are required" });
    }
    const result = await register(email, password, repeatPassword);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
