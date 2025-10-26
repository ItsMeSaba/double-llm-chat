import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";
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
