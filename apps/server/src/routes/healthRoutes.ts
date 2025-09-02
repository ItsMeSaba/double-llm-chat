import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

router.get("/ready", (_req: Request, res: Response) => {
  res.json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

router.get("/live", (_req: Request, res: Response) => {
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRoutes };
