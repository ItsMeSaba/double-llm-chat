import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { chats } from "../../../db/schema";

export async function getOrCreateChat(userId: number) {
  const existingChat = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .limit(1);

  if (existingChat.length > 0) {
    return existingChat[0];
  }

  // Create a new chat if none exists
  const newChat = await db
    .insert(chats)
    .values({
      userId,
      title: "New Chat",
    })
    .returning();

  return newChat[0];
}
