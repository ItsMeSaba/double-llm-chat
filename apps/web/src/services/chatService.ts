import { http } from "../service/http";

export interface ModelResponse {
  id: number;
  model: string;
  response: string;
  createdAt: Date;
}

export interface MessageWithResponses {
  id: number;
  content: string;
  sender: string;
  createdAt: Date;
  responses: ModelResponse[];
}

export interface FetchMessagesResponse {
  success: boolean;
  data: {
    chatId: number;
    messages: MessageWithResponses[];
  };
}

// Message interface expected by DualChatPage
export interface DualChatMessage {
  id: string;
  text: string;
  sender: "user" | "gpt-4o-mini" | "gemini-1.5-flash";
  timestamp: Date;
  messageId?: number;
}

export async function fetchUserMessages(): Promise<FetchMessagesResponse> {
  const response = await http("/chat/messages", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const data = await response.json();

  // Convert date strings back to Date objects
  data.data.messages.forEach((message: MessageWithResponses) => {
    message.createdAt = new Date(message.createdAt);
    message.responses.forEach((response: ModelResponse) => {
      response.createdAt = new Date(response.createdAt);
    });
  });

  return data;
}

export function transformToSocketMessages(
  messagesWithResponses: MessageWithResponses[]
): DualChatMessage[] {
  const result: DualChatMessage[] = [];

  messagesWithResponses.forEach((message) => {
    // Add the user message
    if (message.sender === "user") {
      result.push({
        id: message.id.toString(),
        text: message.content,
        sender: "user",
        timestamp: message.createdAt,
        messageId: message.id,
      });
    }

    // Add model responses
    message.responses.forEach((response) => {
      if (
        response.model === "gpt-4o-mini" ||
        response.model === "gemini-1.5-flash"
      ) {
        result.push({
          id: `${message.id}-${response.id}`,
          text: response.response,
          sender: response.model as "gpt-4o-mini" | "gemini-1.5-flash",
          timestamp: response.createdAt,
          messageId: message.id,
        });
      }
    });
  });

  // Sort by timestamp to ensure chronological order
  result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return result;
}
