import { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { chats, messages, modelResponses } from "../db/schema";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { LLMService } from "./llmService";
import { to } from "@shared/utils/to";
import { eq } from "drizzle-orm";
import { db } from "../db";
import jwt from "jsonwebtoken";

interface SocketUser {
  userId: string;
  email: string;
}

interface ChatMessage {
  message: string;
  chatId?: number;
}

export class SocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private llmService: LLMService;

  constructor(server: HTTPServer) {
    this.llmService = new LLMService();
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("No token provided"));

      const result = await to(async () => {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

        console.log("payload", payload);

        socket.data.user = {
          userId: String(payload.userId),
          email: payload.email,
        } satisfies SocketUser;

        next();
      });

      if (!result.ok) {
        console.error("Authentication error:", result.error);
        next(new Error("Authentication failed"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.use(([_event, _payload, _ack], next) => {
        if (!socket.data.user) return next(new Error("Not authenticated"));
        next();
      });

      socket.on("authenticate", async (userData: SocketUser) => {
        const result = await to(() => {
          console.log(
            `User ${userData.email} authenticated with socket ${socket.id}`
          );

          socket.emit("authenticated", { success: true });
        });

        if (!result.ok) {
          console.error("Authentication error:", result.error);
          socket.emit("authenticated", {
            success: false,
            error: "Authentication failed",
          });
        }
      });

      socket.on("send_message", async (data: ChatMessage, ack) => {
        try {
          const user = socket.data.user as SocketUser;

          if (!user) {
            return ack?.({ error: "User not authenticated" });
          }

          console.log("user", user);

          const chat = await this.getOrCreateChat(parseInt(user.userId));
          const savedMessage = await this.saveMessage(
            chat.id,
            "user",
            data.message
          );

          console.log("passed saved message");
          const llmResponses = await this.processWithLLMs(
            savedMessage.id,
            data.message
          );

          const messageWithLLMResponses: MessageWithLLMResponsesDTO = {
            id: savedMessage.id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            createdAt: savedMessage.createdAt,
            responses: llmResponses,
          };

          ack?.({
            messageWithLLMResponses,
          });
        } catch (error) {
          console.error("Error processing message:", error);
          ack?.({ error: "Failed to process message" });
        }
      });

      socket.on("disconnect", () => {
        const user = socket.data.user as SocketUser;
        if (user) {
          this.userSockets.delete(user.userId);
          console.log(`User ${user.email} disconnected`);
        }
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  private async getOrCreateChat(userId: number) {
    const existingChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    if (existingChat.length > 0) {
      return existingChat[0];
    }

    // Create a new chat if none exists
    const newChat = await db
      .insert(chats)
      .values({
        userId,
        title: "New Chat",
      })
      .returning();

    return newChat[0];
  }

  private async saveMessage(chatId: number, sender: string, content: string) {
    const savedMessage = await db
      .insert(messages)
      .values({
        chatId,
        sender,
        content,
      })
      .returning();

    return savedMessage[0];
  }

  private async processWithLLMs(messageId: number, userMessage: string) {
    try {
      const llmResponses = await this.llmService.callAllLLMs(
        userMessage,
        messageId
      );

      for (const response of llmResponses) {
        await this.saveLLMResponse(messageId, response.model, response.content);
      }

      return llmResponses;
    } catch (error) {
      console.error("Error processing with LLMs:", error);
      return [];
    }
  }

  private async saveLLMResponse(
    messageId: number,
    model: string,
    content: string
  ) {
    await db.insert(modelResponses).values({
      messageId,
      model,
      content,
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
