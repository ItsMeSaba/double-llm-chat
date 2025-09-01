import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { setupRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { authMiddleware } from "./middleware/auth";
import { corsOptions } from "./config/cors";
import cors from "cors";
import { SocketService } from "./services/socketService";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize middleware
function initializeMiddleware(): void {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(morgan("combined"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(authMiddleware);
}

// Initialize routes
function initializeRoutes(): void {
  setupRoutes(app);
}

// Initialize Socket.IO
function initializeSocketIO(): void {
  new SocketService(server);
  console.log("🔌 Socket.IO service initialized");
}

// Initialize error handling
function initializeErrorHandling(): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

// Start the server
function startServer(): void {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Main function to bootstrap the server
function bootstrap(): void {
  initializeMiddleware();
  initializeRoutes();
  initializeSocketIO();
  initializeErrorHandling();
  startServer();
}

// Start the application
bootstrap();

export default app;
