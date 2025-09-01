import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../service/http";

interface SocketMessage {
  messageId: number;
  chatId: number;
  content: string;
  sender: string;
  timestamp: Date;
}

interface LLMResponse {
  model: string;
  response: string;
  messageId: number;
}

interface LLMResponsesEvent {
  messageId: number;
  responses: LLMResponse[];
}

export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // const serverUrl =
    //   import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
    const serverUrl = "http://localhost:3000";

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.handleReconnect();
    });

    this.socket.on(
      "authenticated",
      (data: { success: boolean; error?: string }) => {
        if (data.success) {
          console.log("Socket authenticated successfully");
        } else {
          console.error("Socket authentication failed:", data.error);
        }
      }
    );

    this.socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
    });
  }

  private async authenticate() {
    if (!this.socket || !this.isConnected) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token available for socket authentication");
      return;
    }

    try {
      // Decode JWT to get user info (you might want to store this in context/state)
      const tokenPayload = this.decodeJWT(accessToken);
      if (tokenPayload) {
        this.socket.emit("authenticate", {
          userId: tokenPayload.userId,
          email: tokenPayload.email,
        });
      }
    } catch (error) {
      console.error("Error during socket authentication:", error);
    }
  }

  private decodeJWT(token: string) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  public connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public sendMessage(
    message: string,
    onMessageReceived?: (data: SocketMessage) => void
  ) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("send_message", { message });

    if (onMessageReceived) {
      this.socket.once("message_received", onMessageReceived);
    }
  }

  public onLLMResponses(callback: (data: LLMResponsesEvent) => void) {
    if (!this.socket) return;
    this.socket.on("llm_responses", callback);
  }

  public onError(callback: (data: { message: string }) => void) {
    if (!this.socket) return;
    this.socket.on("error", callback);
  }

  public onConnect(callback: () => void) {
    if (!this.socket) return;
    this.socket.on("connect", callback);
  }

  public onDisconnect(callback: () => void) {
    if (!this.socket) return;
    this.socket.on("disconnect", callback);
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create a singleton instance
export const socketService = new SocketService();
