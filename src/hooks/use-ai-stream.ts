"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type StreamingMessage = {
  id: string;
  content: string;
  role: "assistant";
};

type ChunkEvent = {
  event: "ai.chunk";
  data: { content: string };
  channel: string;
};

type DoneEvent = {
  event: "ai.done";
  data: { messageId: string };
  channel: string;
};

type ErrorEvent = {
  event: "ai.error";
  data: { error: string };
  channel: string;
};

type RealtimeEvent = ChunkEvent | DoneEvent | ErrorEvent;

function isChunkEvent(event: RealtimeEvent): event is ChunkEvent {
  return event.event === "ai.chunk";
}

function isDoneEvent(event: RealtimeEvent): event is DoneEvent {
  return event.event === "ai.done";
}

function isErrorEvent(event: RealtimeEvent): event is ErrorEvent {
  return event.event === "ai.error";
}

function isRealtimeEvent(payload: unknown): payload is RealtimeEvent {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const event = payload as { event?: unknown };

  return event.event === "ai.chunk" || event.event === "ai.done" || event.event === "ai.error";
}

const INITIAL_STREAMING_MESSAGE: StreamingMessage = {
  id: "streaming",
  content: "",
  role: "assistant",
};

function getChatApiEndpoint(): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return "/api/workflow";
  }

  return "/api/chat";
}

function createStreamingMessageWithChunk(
  previousMessage: StreamingMessage | null,
  newContent: string,
): StreamingMessage {
  return {
    id: "streaming",
    content: (previousMessage?.content ?? "") + newContent,
    role: "assistant",
  };
}

function updateStreamingMessageWithFinalId(
  previousMessage: StreamingMessage | null,
  messageId: string,
): StreamingMessage | null {
  if (!previousMessage) {
    return null;
  }

  return {
    ...previousMessage,
    id: messageId,
  };
}

export function useAiStream(chatId: string, serverMessageIds: string[]) {
  const router = useRouter();
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    const completedMessageId = completedMessageIdRef.current;

    if (!completedMessageId) {
      return;
    }

    if (!serverMessageIds.includes(completedMessageId)) {
      return;
    }

    completedMessageIdRef.current = null;
    setStreamingMessage(null);
    setIsStreaming(false);
  }, [serverMessageIds]);

  const handleChunkEvent = useCallback((data: ChunkEvent["data"]) => {
    setStreamingMessage((previousMessage) =>
      createStreamingMessageWithChunk(previousMessage, data.content),
    );
  }, []);

  const handleDoneEvent = useCallback(
    (data: DoneEvent["data"]) => {
      completedMessageIdRef.current = data.messageId;

      setStreamingMessage((previousMessage) =>
        updateStreamingMessageWithFinalId(previousMessage, data.messageId),
      );

      setIsStreaming(false);
      router.refresh();
    },
    [router],
  );

  const handleErrorEvent = useCallback((data: ErrorEvent["data"]) => {
    setError(data.error);
    setStreamingMessage(null);
    setIsStreaming(false);
  }, []);

  const handleRealtimeEvent = useCallback(
    (payload: unknown) => {
      if (!isRealtimeEvent(payload)) {
        return;
      }

      if (isChunkEvent(payload)) {
        handleChunkEvent(payload.data);
        return;
      }

      if (isDoneEvent(payload)) {
        handleDoneEvent(payload.data);
        return;
      }

      if (isErrorEvent(payload)) {
        handleErrorEvent(payload.data);
      }
    },
    [handleChunkEvent, handleDoneEvent, handleErrorEvent],
  );

  useRealtime({
    events: ["ai.chunk", "ai.done", "ai.error"],
    channels: [`chat-${chatId}`],
    onData: handleRealtimeEvent,
  });

  const triggerGeneration = useCallback(
    async (userMessageContent: string) => {
      setError(null);
      setIsStreaming(true);
      setStreamingMessage(INITIAL_STREAMING_MESSAGE);

      const endpoint = getChatApiEndpoint();

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, userMessageContent }),
      });
    },
    [chatId],
  );

  return {
    streamingMessage,
    isStreaming,
    error,
    triggerGeneration,
  };
}
