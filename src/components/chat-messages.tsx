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
};

export function ChatMessages({ messages }: Props) {
  return (
    <Conversation className="relative min-h-0 flex-1">
      <ConversationContent>
        {messages.length === 0 ? (
          <ConversationEmptyState
            description="Start the conversation by typing a message."
            icon={<IconMessage className="size-6" />}
            title="No messages yet"
          />
        ) : (
          messages.map((msg) => (
            <Message from={msg.role} key={msg.id}>
              <MessageContent>{msg.content}</MessageContent>
            </Message>
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
