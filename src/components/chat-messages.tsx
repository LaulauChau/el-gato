import { IconMessage } from "@tabler/icons-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";

type MessageData = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

type Props = {
  messages: MessageData[];
  streamingMessage?: MessageData | null;
};

function combineMessages(
  messages: MessageData[],
  streamingMessage?: MessageData | null,
): MessageData[] {
  if (!streamingMessage) {
    return messages;
  }

  return [...messages, streamingMessage];
}

export function ChatMessages({ messages, streamingMessage }: Props) {
  const allMessages = combineMessages(messages, streamingMessage);

  if (allMessages.length === 0) {
    return (
      <Conversation className="relative min-h-0 flex-1">
        <ConversationContent>
          <ConversationEmptyState
            description="Start the conversation by typing a message."
            icon={<IconMessage className="size-6" />}
            title="No messages yet"
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    );
  }

  return (
    <Conversation className="relative min-h-0 flex-1">
      <ConversationContent>
        {allMessages.map((message) => (
          <Message from={message.role} key={message.id}>
            <MessageContent>{message.content}</MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
