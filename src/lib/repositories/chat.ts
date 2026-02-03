import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { chat, message } from "@/lib/db/schemas";

export async function createChat(input: string) {
  const [newChat] = await db
    .insert(chat)
    .values({ title: input.slice(0, 50) })
    .returning();

  if (!newChat) {
    throw new Error("Error creating new chat");
  }

  await db.insert(message).values({ chatId: newChat.id, content: input, role: "user" });

  return { chat: newChat };
}

export async function getChatById(id: string) {
  const row = await db.query.chat.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });

  return row ?? null;
}

export async function getChats() {
  return db.query.chat.findMany({
    orderBy: (table, { desc }) => desc(table.updatedAt),
  });
}

export async function deleteChatById(id: string) {
  return db.delete(chat).where(eq(chat.id, id)).returning();
}
