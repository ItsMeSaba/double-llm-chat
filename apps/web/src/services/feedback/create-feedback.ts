import { http } from "../http";

export interface FeedbackRequest {
  messageId: number;
  winnerModel: "gpt-4o-mini" | "gemini-1.5-flash";
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data: {
    messageId: number;
    winnerModel: string;
  };
}

export async function createFeedback(
  feedback: FeedbackRequest
): Promise<FeedbackResponse> {
  const response = await http("/chat/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit feedback: ${response.status}`);
  }

  return await response.json();
}
