"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { treeifyError, z } from "zod";

import { createChat, deleteChatById, getChatById } from "./repositories/chat";
import { createMessage } from "./repositories/message";
import { err } from "./utils";

const createChatSchema = z.object({
  messageContent: z.string().min(1, { error: "Message content is required" }),
});

export async function createNewChat(formData: FormData) {
  const result = createChatSchema.safeParse({
    messageContent: formData.get("messageContent"),
  });

  if (!result.success) {
    return err(treeifyError(result.error));
  }

  const { chat: newChat } = await createChat(result.data.messageContent);

  redirect(`/chat/${newChat.id}`);
}

const createMessageSchema = z.object({
  chatId: z.uuid(),
  messageContent: z.string().min(1, { error: "Message content is required" }),
});

export async function createNewMessage(formData: FormData) {
  const result = createMessageSchema.safeParse({
    chatId: formData.get("chatId"),
    messageContent: formData.get("messageContent"),
  });

  if (!result.success) {
    return err(treeifyError(result.error));
  }

  await createMessage(result.data.chatId, result.data.messageContent, "user");

  revalidatePath(`/chat/${result.data.chatId}`);
}

const deleteChatSchema = z.object({
  id: z.uuid(),
});

export async function deleteChat(input: { id: string }) {
  const result = deleteChatSchema.safeParse(input);

  if (!result.success) {
    return err(treeifyError(result.error));
  }

  const existingChat = await getChatById(result.data.id);

  if (!existingChat) {
    return err(`Chat ${result.data.id} doesn't exist`);
  }

  const [deletedChat] = await deleteChatById(result.data.id);

  if (!deletedChat) {
    return err(`Error deleting chat ${result.data.id}`);
  }

  revalidateTag("chat", "max");
  redirect("/");
}
