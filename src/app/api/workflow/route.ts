import { serve } from "@upstash/workflow/nextjs";

import { env } from "@/config/env";
import { type ChatMessage, streamChatCompletion } from "@/lib/mistral";
import { realtime } from "@/lib/realtime";
import { createMessage } from "@/lib/repositories/message";

const MAX_HISTORY_MESSAGES = 20;

type WorkflowPayload = {
  chatId: string;
  userMessageContent: string;
};

function buildMessagesWithCurrentInput(
  recentMessages: ChatMessage[],
  currentUserMessage: string,
): ChatMessage[] {
  const historyContainsCurrentMessage = recentMessages.some(
    (message) => message.role === "user" && message.content === currentUserMessage,
  );

  if (historyContainsCurrentMessage) {
    return recentMessages;
  }

  return [...recentMessages, { role: "user", content: currentUserMessage }];
}

export const { POST } = serve<WorkflowPayload>(
  async (context) => {
    const { chatId, userMessageContent } = context.requestPayload;
    const channel = realtime.channel(`chat-${chatId}`);

    const recentMessages = await context.run("fetch-history", async () => {
      const { getMessagesByChatId } = await import("@/lib/repositories/message");
      const allMessages = await getMessagesByChatId(chatId);

      return allMessages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
        role: message.role,
        content: message.content,
      }));
    });

    const messagesForCompletion = buildMessagesWithCurrentInput(recentMessages, userMessageContent);

    let fullResponseContent = "";

    await context.run("stream-completion", async () => {
      for await (const chunk of streamChatCompletion(messagesForCompletion)) {
        fullResponseContent += chunk;
        await channel.emit("ai.chunk", { content: chunk });
      }
    });

    const savedMessage = await context.run("save-message", async () => {
      return createMessage(chatId, fullResponseContent, "assistant");
    });

    await context.run("notify-completion", async () => {
      await channel.emit("ai.done", { messageId: savedMessage.id });
    });
  },
  {
    baseUrl: env.NODE_ENV === "development" ? "http://localhost:3000" : undefined,
    receiver: undefined,
    async failureFunction({ context }) {
      const { chatId } = context.requestPayload;
      const channel = realtime.channel(`chat-${chatId}`);

      await channel.emit("ai.error", { error: "Workflow failed" });
    },
  },
);
