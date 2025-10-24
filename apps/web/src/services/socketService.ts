// services/socketService.ts
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./http";
import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";

type SocketMessage = {
  messageId: number;
  chatId: number;
  content: string;
  sender: string;
  timestamp: string;
};

type ModelId = "gpt-4o-mini" | "gemini-1.5-flash";
type LLMResponse = { model: ModelId; response: string; messageId: number };
type LLMResponsesEvent = { messageId: number; responses: LLMResponse[] };

export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // base ms

  constructor() {}

  private setupSocket() {
    // FIXME: fix variable
    // const serverUrl =
    //   import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";
    const serverUrl = "http://localhost:3000";

    const token = getAccessToken();

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      auth: token ? { token } : undefined,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connect_error:", error);
      this.handleReconnect();
    });

    // Important: expose a namespaced error channel from server (e.g., 'app_error')
    this.socket.on("app_error", (data: { message: string }) => {
      console.error("Socket app_error:", data.message);
    });
  }

  private handleReconnect() {
    if (!this.socket) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }
    this.reconnectAttempts++;
    const expo = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);
    const jitter = Math.floor(Math.random() * 250); // add small jitter
    const delay = Math.min(expo + jitter, 10_000); // cap at 10s

    setTimeout(() => {
      // Re-attach updated token before reconnect (in case it refreshed)
      const token = getAccessToken();
      if (token && this.socket) this.socket.auth = { token };
      this.socket?.connect();
    }, delay);
  }

  connect() {
    if (!this.socket) this.setupSocket();
    if (this.isConnected) return;
    // attach latest token on each connect attempt
    const token = getAccessToken();
    if (token && this.socket) this.socket.auth = { token };
    this.socket?.connect();
  }

  disconnect() {
    this.socket?.disconnect();
    this.isConnected = false;
  }

  sendMessage(
    message: string,
    onAck?: (data: {
      messageWithLLMResponses: MessageWithLLMResponsesDTO;
    }) => void
  ) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    console.log("Sending message socketService front:", message);

    this.socket.emit(
      "send_message",
      { message },
      (ack?: { messageWithLLMResponses: MessageWithLLMResponsesDTO }) => {
        if (ack && onAck) onAck(ack);
      }
    );
  }

  onError(cb: (data: { message: string }) => void) {
    if (!this.socket) return () => {};
    // Use your custom channel, not the built-in 'error'
    this.socket.on("app_error", cb);
    return () => this.socket?.off("app_error", cb);
  }

  onConnect(cb: () => void) {
    if (!this.socket) return () => {};
    this.socket.on("connect", cb);
    return () => this.socket?.off("connect", cb);
  }

  onDisconnect(cb: () => void) {
    if (!this.socket) return () => {};
    this.socket.on("disconnect", cb);
    return () => this.socket?.off("disconnect", cb);
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Lazy singleton (no side effects at import)
let _instance: SocketService | null = null;
export function socketService(): SocketService {
  if (!_instance) _instance = new SocketService();
  return _instance;
}
