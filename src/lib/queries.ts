import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { treeifyError, z } from "zod";

import { getChatById as getChatByIdDb, getChats as getChatsDb } from "./repositories/chat";
import { err, ok } from "./utils";

export const getChats = cache(async () => {
  "use cache";

  const chats = await getChatsDb();

  cacheTag("chat");
  cacheLife("hours");

  return ok(chats);
});

const getChatByIdSchema = z.object({ id: z.uuid() });

export const getChatById = cache(async (input: { id: string }) => {
  "use cache";

  const result = getChatByIdSchema.safeParse(input);

  if (!result.success) {
    return err(treeifyError(result.error));
  }

  const chat = await getChatByIdDb(result.data.id);

  if (chat) {
    cacheTag(`chat-${chat.id}`);
    cacheLife("hours");
  }

  return ok(chat);
});
