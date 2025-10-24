import type { LLMResponse } from "../types/global";

export interface MessageWithLLMResponsesDTO {
  id: number;
  content: string;
  sender: string;
  createdAt: Date;
  responses: LLMResponse[];
  feedback?: {
    id: number;
    winnerModel: string;
  } | null;
}
