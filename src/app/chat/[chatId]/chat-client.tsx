"use client";

import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useAiStream } from "@/hooks/use-ai-stream";
import { createNewMessage } from "@/lib/actions";

type MessageData = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

type Props = {
  chatId: string;
  messages: MessageData[];
};

function extractMessageContent(formData: FormData): string {
  const rawContent = formData.get("messageContent");

  if (typeof rawContent === "string") {
    return rawContent;
  }

  return "";
}

function createOptimisticMessage(content: string): MessageData {
  return {
    id: `optimistic-${Date.now()}`,
    content,
    role: "user",
  };
}

function shouldShowStreamingMessage(
  streamingMessage: MessageData | null,
  serverMessageIds: string[],
): MessageData | null {
  if (!streamingMessage) {
    return null;
  }

  if (serverMessageIds.includes(streamingMessage.id)) {
    return null;
  }

  return streamingMessage;
}

function shouldAutoTriggerGeneration(
  messages: MessageData[],
  isStreaming: boolean,
  hasTriggered: boolean,
): boolean {
  if (hasTriggered) {
    return false;
  }

  if (isStreaming) {
    return false;
  }

  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return false;
  }

  return lastMessage.role === "user";
}

export function ChatClient({ chatId, messages }: Props) {
  const serverMessageIds = messages.map((message) => message.id);
  const { streamingMessage, isStreaming, triggerGeneration } = useAiStream(
    chatId,
    serverMessageIds,
  );

  const hasTriggeredRef = useRef(false);
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<MessageData | null>(null);

  const visibleStreamingMessage = shouldShowStreamingMessage(streamingMessage, serverMessageIds);

  useEffect(() => {
    const shouldTrigger = shouldAutoTriggerGeneration(
      messages,
      isStreaming,
      hasTriggeredRef.current,
    );

    if (!shouldTrigger) {
      return;
    }

    const lastMessage = messages.at(-1);

    if (!lastMessage) {
      return;
    }

    hasTriggeredRef.current = true;
    void triggerGeneration(lastMessage.content);
  }, [messages, isStreaming, triggerGeneration]);

  async function handleCreateMessage(formData: FormData) {
    const content = extractMessageContent(formData);

    setOptimisticUserMessage(createOptimisticMessage(content));

    const result = await createNewMessage(formData);

    if (result && "success" in result && !result.success) {
      setOptimisticUserMessage(null);
      return result;
    }

    setOptimisticUserMessage(null);
    void triggerGeneration(content);
  }

  const displayMessages = optimisticUserMessage ? [...messages, optimisticUserMessage] : messages;

  return (
    <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden">
      <ChatMessages messages={displayMessages} streamingMessage={visibleStreamingMessage} />
      <div className="shrink-0 pb-4">
        <ChatInput
          action={handleCreateMessage}
          chatId={chatId}
          placeholder="Send a message..."
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
