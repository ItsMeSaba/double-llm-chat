import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIModel, LLMResponse } from "@shared/types/global";
import { to } from "@shared/utils/to";

const FALLBACK_MSG =
  "Sorry, I encountered an error while processing your request.";

function normalizeText(s: string | null | undefined) {
  const trimmed = (s ?? "").trim();
  return trimmed.length ? trimmed : "No response generated";
}

export class LLMService {
  private _openai?: OpenAI;
  private _gemini?: GoogleGenerativeAI;

  private get openai() {
    if (!this._openai) {
      const key = process.env.OPENAI_API_KEY;

      if (!key) throw new Error("OPENAI_API_KEY is not set");

      this._openai = new OpenAI({ apiKey: key });
    }

    return this._openai;
  }

  private get gemini() {
    if (!this._gemini) {
      const key = process.env.GOOGLE_GEMINI_API_KEY;

      if (!key) throw new Error("GOOGLE_GEMINI_API_KEY is not set");

      this._gemini = new GoogleGenerativeAI(key);
    }

    return this._gemini;
  }

  async callGPT4Mini(message: string): Promise<string> {
    const result = await to(async () => {
      const completion = await this.openai.chat.completions.create({
        model: AIModel.GPT_4O_MINI,
        messages: [{ role: "user", content: message }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return normalizeText(completion.choices[0]?.message?.content);
    });

    if (!result.ok) {
      console.error("Error calling GPT-4o-mini:", result.error);
      throw new Error("Failed to get response from GPT-4o-mini");
    }

    console.log("result.data openai", result.data);
    return result.data;
  }

  async callGeminiFlash(message: string): Promise<string> {
    const result = await to(async () => {
      const model = this.gemini.getGenerativeModel({
        model: AIModel.GEMINI_1_5_FLASH,
      });

      const result = await model.generateContent(message);
      console.log("result", result);

      const response = await result.response;

      console.log("response.text()", response.text());
      return normalizeText(response.text());
    });

    if (!result.ok) {
      console.error("Error calling Gemini-1.5-flash:", result.error);
      throw new Error(`${result.error}`);
    }

    console.log("result.data gemini", result.data);
    return result.data;
  }

  async callAllLLMs(
    userMessage: string,
    messageId: number
  ): Promise<LLMResponse[]> {
    const calls: { model: AIModel; run: () => Promise<string> }[] = [
      { model: AIModel.GPT_4O_MINI, run: () => this.callGPT4Mini(userMessage) },
      {
        model: AIModel.GEMINI_1_5_FLASH,
        run: () => this.callGeminiFlash(userMessage),
      },
    ];

    const settled = await Promise.allSettled(
      // TODO: add timeout
      calls.map(({ run }) => run())
    );

    return settled.map((res, i) => {
      const model = calls[i].model;

      if (res.status === "fulfilled") {
        return { model, response: res.value, messageId };
      }

      console.error(`${model} failed:`, res.reason);
      return { model, response: FALLBACK_MSG, messageId };
    });
  }
}
