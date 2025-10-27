import {
  fetchFeedback as fetchFeedbackFromRepo,
  insertFeedback as insertFeedbackToRepo,
  updateFeedback as updateFeedbackInRepo,
} from "./feedback.repo";
import { db } from "../../db";
import { feedback, messages } from "../../db/schema";
import { eq, count } from "drizzle-orm";
import { getOrCreateChat } from "../../base/helpers/chat/get-or-create-chat";
import { AIModel } from "@shared/types/global";

export const fetchFeedback = async (messageId: number) => {
  return await fetchFeedbackFromRepo(messageId);
};

export const insertFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await insertFeedbackToRepo(messageId, winnerModel);
};

export const updateFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await updateFeedbackInRepo(messageId, winnerModel);
};

export const getFeedbackStats = async (userId: number) => {
  const chat = await getOrCreateChat(userId);
  if (!chat) {
    return null;
  }

  const feedbackStats = await db
    .select({
      winnerModel: feedback.winnerModel,
      count: count(),
    })
    .from(feedback)
    .innerJoin(messages, eq(feedback.messageId, messages.id))
    .where(eq(messages.chatId, chat.id))
    .groupBy(feedback.winnerModel);

  const chartData = feedbackStats.map((stat) => ({
    name:
      stat.winnerModel === "gpt-4o-mini" ? "GPT-4o Mini" : "Gemini 1.5 Flash",
    value: stat.count,
    model: stat.winnerModel,
  }));

  const totalFeedback = feedbackStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );

  return {
    chartData,
    totalFeedback,
    summary: {
      gptLikes:
        feedbackStats.find((stat) => stat.winnerModel === AIModel.GPT_4O_MINI)
          ?.count || 0,
      geminiLikes:
        feedbackStats.find(
          (stat) => stat.winnerModel === AIModel.GEMINI_1_5_FLASH
        )?.count || 0,
    },
  };
};
