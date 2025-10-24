import { AIModel } from "../types/global";

export interface ModelResponse {
  id: number;
  model: string;
  content: string;
  createdAt: Date;
}

export interface MessageWithResponses {
  id: number;
  content: string;
  sender: string;
  createdAt: Date;
  responses: ModelResponse[];
  feedback?: {
    winnerModel?: string;
  };
}

// Message interface expected by DualChatPage
export interface DualChatMessage {
  id: string;
  text: string;
  sender: "user" | AIModel;
  timestamp: Date;
  messageId?: number;
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
        response.model === AIModel.GPT_4O_MINI ||
        response.model === AIModel.GEMINI_1_5_FLASH
      ) {
        result.push({
          id: `${message.id}-${response.id}`,
          text: response.content,
          sender: response.model as AIModel,
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
