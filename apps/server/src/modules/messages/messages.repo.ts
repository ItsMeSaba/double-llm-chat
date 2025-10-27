import { messageAdapter } from "@/base/adapters/messages.adapter";
import { messages, modelResponses, feedback } from "@/db/schema";
import { alias } from "drizzle-orm/sqlite-core";
import { AIModel } from "@shared/types/global";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/db";

export const fetchMessages = async (chatId: number) => {
  return await db.select().from(messages).where(eq(messages.chatId, chatId));
};

export const insertMessage = async (
  chatId: number,
  sender: string,
  content: string
) => {
  return await db
    .insert(messages)
    .values({ chatId, sender, content })
    .returning();
};

export const fetchMessagesWithDetails = async (chatId: number) => {
  const gptResponse = alias(modelResponses, "gpt_response");
  const geminiResponse = alias(modelResponses, "gemini_response");

  const messagesWithResponses = await db
    .select({
      messageId: messages.id,
      messageContent: messages.content,
      messageSender: messages.sender,
      messageCreatedAt: messages.createdAt,
      gptResponseId: gptResponse.id,
      gptResponseContent: gptResponse.content,
      geminiResponseId: geminiResponse.id,
      geminiResponseContent: geminiResponse.content,
      feedbackId: feedback.id,
      winnerModel: feedback.winnerModel,
    })
    .from(messages)
    .fullJoin(
      gptResponse,
      and(
        eq(messages.id, gptResponse.messageId),
        eq(gptResponse.model, AIModel.GPT_4O_MINI)
      )
    )
    .fullJoin(
      geminiResponse,
      and(
        eq(messages.id, geminiResponse.messageId),
        eq(geminiResponse.model, AIModel.GEMINI_1_5_FLASH)
      )
    )
    .leftJoin(feedback, eq(messages.id, feedback.messageId))
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt));

  const formattedMessages = messagesWithResponses.map(messageAdapter);

  return formattedMessages;
};
