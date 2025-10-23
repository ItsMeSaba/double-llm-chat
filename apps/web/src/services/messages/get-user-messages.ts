import type { FetchMessagesResponse } from "../chatService";
import { http } from "../http";

export async function getUserMessages(): Promise<FetchMessagesResponse> {
  const response = await http("/chat/messages", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
