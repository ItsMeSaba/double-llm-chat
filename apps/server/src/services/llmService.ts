import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMResponse {
  model: string;
  response: string;
  messageId: number;
}

export class LLMService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  }

  async callGPT4Mini(message: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      console.error("Error calling GPT-4o-mini:", error);
      throw new Error("Failed to get response from GPT-4o-mini");
    }
  }

  async callGeminiFlash(message: string): Promise<string> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent(message);
      const response = await result.response;

      return response.text() || "No response generated";
    } catch (error) {
      console.error("Error calling Gemini-1.5-flash:", error);
      throw new Error("Failed to get response from Gemini-1.5-flash");
    }
  }

  async callAllLLMs(userMessage: string): Promise<LLMResponse[]> {
    const responses: LLMResponse[] = [];

    try {
      // Call both LLMs in parallel for better performance
      const [gptResponse, geminiResponse] = await Promise.allSettled([
        this.callGPT4Mini(userMessage),
        this.callGeminiFlash(userMessage),
      ]);

      // Add GPT-4o-mini response
      if (gptResponse.status === "fulfilled") {
        responses.push({
          model: "gpt-4o-mini",
          response: gptResponse.value,
          messageId: 0, // Will be set by caller
        });
      } else {
        console.error("GPT-4o-mini failed:", gptResponse.reason);
        responses.push({
          model: "gpt-4o-mini",
          response:
            "Sorry, I encountered an error while processing your request.",
          messageId: 0,
        });
      }

      // Add Gemini-1.5-flash response
      if (geminiResponse.status === "fulfilled") {
        responses.push({
          model: "gemini-1.5-flash",
          response: geminiResponse.value,
          messageId: 0,
        });
      } else {
        console.error("Gemini-1.5-flash failed:", geminiResponse.reason);
        responses.push({
          model: "gemini-1.5-flash",
          response:
            "Sorry, I encountered an error while processing your request.",
          messageId: 0,
        });
      }

      return responses;
    } catch (error) {
      console.error("Error calling LLMs:", error);
      throw error;
    }
  }
}
