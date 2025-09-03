import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { db } from "../db";
import { chats, messages, modelResponses } from "../db/schema";
import { eq } from "drizzle-orm";
import { LLMService, LLMResponse } from "./llmService";

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
    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("authenticate", async (userData: SocketUser) => {
        try {
          this.userSockets.set(userData.userId, socket.id);
          socket.data.user = userData;
          console.log(
            `User ${userData.email} authenticated with socket ${socket.id}`
          );

          socket.emit("authenticated", { success: true });
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("authenticated", {
            success: false,
            error: "Authentication failed",
          });
        }
      });

      socket.on("send_message", async (data: ChatMessage) => {
        try {
          const user = socket.data.user as SocketUser;
          if (!user) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          const chat = await this.getOrCreateChat(parseInt(user.userId));

          const savedMessage = await this.saveMessage(
            chat.id,
            "user",
            data.message
          );

          socket.emit("message_received", {
            messageId: savedMessage.id,
            chatId: chat.id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            timestamp: savedMessage.createdAt,
          });

          await this.processWithLLMs(savedMessage.id, data.message, socket);
        } catch (error) {
          console.error("Error processing message:", error);
          socket.emit("error", { message: "Failed to process message" });
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

  private async processWithLLMs(
    messageId: number,
    userMessage: string,
    socket: any
  ) {
    try {
      const llmResponses = await this.callLLMs(userMessage, messageId);

      for (const response of llmResponses) {
        await this.saveLLMResponse(
          messageId,
          response.model,
          response.response
        );
      }

      socket.emit("llm_responses", {
        messageId,
        responses: llmResponses,
      });
    } catch (error) {
      console.error("Error processing with LLMs:", error);
      socket.emit("error", { message: "Failed to get LLM responses" });
    }
  }

  private async callLLMs(
    userMessage: string,
    messageId: number
  ): Promise<LLMResponse[]> {
    return await this.llmService.callAllLLMs(userMessage, messageId);
  }

  private async saveLLMResponse(
    messageId: number,
    model: string,
    response: string
  ) {
    await db.insert(modelResponses).values({
      messageId,
      model,
      response,
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
