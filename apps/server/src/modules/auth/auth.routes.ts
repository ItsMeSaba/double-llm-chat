// Placeholder content for authentication module

import { Router } from "express";
import { loginUser, registerUser, refreshToken } from "./auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

export { router as authRoutes };
