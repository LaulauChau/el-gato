import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { message } from "@/lib/db/schemas";

export async function getMessagesByChatId(chatId: string) {
  return db.query.message.findMany({
    where: eq(message.chatId, chatId),
    orderBy: asc(message.createdAt),
  });
}

export async function createMessage(chatId: string, content: string, role: "assistant" | "user") {
  const [newChat] = await db.insert(message).values({ chatId, content, role }).returning();

  if (!newChat) {
    throw new Error("Error creating new message");
  }

  return newChat;
}
