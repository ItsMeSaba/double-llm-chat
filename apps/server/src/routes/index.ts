import { messagesRoutes } from "@/modules/messages/messages.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { Express } from "express";
// import { chatRoutes } from "./chat";

export function setupRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/chat", messagesRoutes);

  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to Supernova Task API",
      version: "1.0.0",
      status: "running",
    });
  });
}
