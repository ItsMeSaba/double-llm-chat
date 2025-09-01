import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../base/helpers/auth/generate-access-token";

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
      };
    }
  }
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/",
];

// Check if the current route is public
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route);
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log("AUTH MIDDLEWARE");
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    console.log("PUBLIC ROUTE");
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("TOKEN MIDDLEWARE", token);

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = verifyAccessToken(token, process.env.JWT_SECRET!);
    if (!decoded) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    console.log("decoded", decoded);
    // Add user info to request for later use
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }
}
