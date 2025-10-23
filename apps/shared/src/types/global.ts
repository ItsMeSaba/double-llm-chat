export enum AIModel {
  GPT_4O_MINI = "gpt-4o-mini",
  GEMINI_1_5_FLASH = "gemini-2.0-flash-lite",
}

export type LLMResponse = {
  model: AIModel;
  response: string;
  messageId: number;
};
