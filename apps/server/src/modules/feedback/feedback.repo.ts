import { feedback } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const fetchFeedback = async (messageId: number) => {
  return await db
    .select()
    .from(feedback)
    .where(eq(feedback.messageId, messageId));
};

export const insertFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await db
    .insert(feedback)
    .values({ messageId, winnerModel })
    .returning();
};

export const updateFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await db
    .update(feedback)
    .set({ winnerModel })
    .where(eq(feedback.messageId, messageId));
};
