import { Express } from "express";
import { healthRoutes } from "./healthRoutes";
import { apiRoutes } from "./apiRoutes";

export function setupRoutes(app: Express): void {
  // Health check route
  app.use("/health", healthRoutes);

  // API routes
  app.use("/api", apiRoutes);

  // Root route
  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to Supernova Task API",
      version: "1.0.0",
      status: "running",
    });
  });
}
