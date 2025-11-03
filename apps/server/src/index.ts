import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";

import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";
import { SocketService } from "./services/socketService";
import { authMiddleware } from "./middleware/auth";
import { corsOptions } from "./config/cors";
import { setupRoutes } from "./routes-deprecated";
import { createServer } from "http";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

function initializeMiddleware(): void {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(morgan("combined"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(authMiddleware);
}

function initializeRoutes(): void {
  setupRoutes(app);
}

function initializeSocketIO(): void {
  new SocketService(server);
  console.log("🔌 Socket.IO service initialized");
}

function initializeErrorHandling(): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

function startServer(): void {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

function bootstrap(): void {
  initializeMiddleware();
  initializeRoutes();
  initializeSocketIO();
  initializeErrorHandling();
  startServer();
}

bootstrap();

export default app;
