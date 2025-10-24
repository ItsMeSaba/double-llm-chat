import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { http } from "../http";

export interface Response {
  success: boolean;
  data: MessageWithLLMResponsesDTO[];
}

export async function getUserMessages(): Promise<Response> {
  const response = await http("/chat/messages", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
