import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { setupRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize middleware
function initializeMiddleware(): void {
  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

// Initialize routes
function initializeRoutes(): void {
  setupRoutes(app);
}

// Initialize error handling
function initializeErrorHandling(): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

// Start the server
function startServer(): void {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Main function to bootstrap the server
function bootstrap(): void {
  initializeMiddleware();
  initializeRoutes();
  initializeErrorHandling();
  startServer();
}

// Start the application
bootstrap();

export default app;
