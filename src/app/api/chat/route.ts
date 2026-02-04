import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { type ChatMessage, streamChatCompletion } from "@/lib/mistral";
import { realtime } from "@/lib/realtime";
import { createMessage, getMessagesByChatId } from "@/lib/repositories/message";

const MAX_HISTORY_MESSAGES = 20;

const requestSchema = z.object({
  chatId: z.uuid(),
  userMessageContent: z.string().min(1),
});

async function buildMessageHistory(
  chatId: string,
  currentUserMessage: string,
): Promise<ChatMessage[]> {
  const allMessages = await getMessagesByChatId(chatId);

  const recentMessages = allMessages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const historyContainsCurrentMessage = recentMessages.some(
    (message) => message.role === "user" && message.content === currentUserMessage,
  );

  if (!historyContainsCurrentMessage) {
    recentMessages.push({ role: "user", content: currentUserMessage });
  }

  return recentMessages;
}

async function streamAndEmitResponse(chatId: string, messages: ChatMessage[]): Promise<string> {
  const channel = realtime.channel(`chat-${chatId}`);
  let fullContent = "";

  for await (const chunk of streamChatCompletion(messages)) {
    fullContent += chunk;
    await channel.emit("ai.chunk", { content: chunk });
  }

  return fullContent;
}

async function saveAndNotifyCompletion(chatId: string, content: string): Promise<string> {
  const savedMessage = await createMessage(chatId, content, "assistant");

  revalidateTag(`chat-messages-${chatId}`, "max");
  revalidatePath(`/chat/${chatId}`);

  const channel = realtime.channel(`chat-${chatId}`);
  await channel.emit("ai.done", { messageId: savedMessage.id });

  return savedMessage.id;
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const { chatId, userMessageContent } = requestSchema.parse(body);

  const messages = await buildMessageHistory(chatId, userMessageContent);
  const responseContent = await streamAndEmitResponse(chatId, messages);
  const messageId = await saveAndNotifyCompletion(chatId, responseContent);

  return new Response(JSON.stringify({ success: true, messageId }), {
    headers: { "Content-Type": "application/json" },
  });
}
