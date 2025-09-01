import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { db } from "../db";
import { chats, messages, modelResponses } from "../db/schema";
import { eq } from "drizzle-orm";

interface SocketUser {
  userId: string;
  email: string;
}

interface ChatMessage {
  message: string;
  chatId?: number;
}

interface LLMResponse {
  model: string;
  response: string;
  messageId: number;
}

export class SocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
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

      // Handle user authentication
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

      // Handle chat messages
      socket.on("send_message", async (data: ChatMessage) => {
        try {
          const user = socket.data.user as SocketUser;
          if (!user) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          // Get or create chat for user
          const chat = await this.getOrCreateChat(parseInt(user.userId));

          // Save user message to database
          const savedMessage = await this.saveMessage(
            chat.id,
            "user",
            data.message
          );

          // Emit message received confirmation
          socket.emit("message_received", {
            messageId: savedMessage.id,
            chatId: chat.id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            timestamp: savedMessage.createdAt,
          });

          // Process with LLMs (simulated for now)
          await this.processWithLLMs(savedMessage.id, data.message, socket);
        } catch (error) {
          console.error("Error processing message:", error);
          socket.emit("error", { message: "Failed to process message" });
        }
      });

      // Handle disconnection
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
    // Try to find an existing chat for the user
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
      // Simulate LLM processing (replace with actual LLM API calls)
      const llmResponses = await this.callLLMs(userMessage);

      // Save LLM responses to database
      for (const response of llmResponses) {
        await this.saveLLMResponse(
          messageId,
          response.model,
          response.response
        );
      }

      console.log("llmResponses", llmResponses);
      socket.emit("llm_responses", {
        messageId,
        responses: llmResponses,
      });
    } catch (error) {
      console.error("Error processing with LLMs:", error);
      socket.emit("error", { message: "Failed to get LLM responses" });
    }
  }

  private async callLLMs(userMessage: string): Promise<LLMResponse[]> {
    // Simulate API calls to different LLMs
    // Replace this with actual LLM API integrations

    const responses: LLMResponse[] = [];

    // Simulate GPT-4o-mini response
    const gptResponse = await this.simulateLLMCall("gpt-4o-mini", userMessage);
    responses.push({
      model: "gpt-4o-mini",
      response: gptResponse,
      messageId: 0, // Will be set by caller
    });

    // Simulate Gemini-1.5-flash response
    const geminiResponse = await this.simulateLLMCall(
      "gemini-1.5-flash",
      userMessage
    );
    responses.push({
      model: "gemini-1.5-flash",
      response: geminiResponse,
      messageId: 0, // Will be set by caller
    });

    return responses;
  }

  private async simulateLLMCall(
    model: string,
    message: string
  ): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate different response styles
    if (model === "gpt-4o-mini") {
      return `[GPT-4o-mini] I understand you said: "${message}". This is a simulated response from OpenAI's GPT-4o-mini model. In a real implementation, this would be an actual API call to the model.`;
    } else {
      return `[Gemini-1.5-flash] You mentioned: "${message}". This is a simulated response from Google's Gemini-1.5-flash model. In a real implementation, this would be an actual API call to the model.`;
    }
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

  // Method to send message to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Method to broadcast to all connected users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
