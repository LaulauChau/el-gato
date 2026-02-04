import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getChatById, getChatMessages } from "@/lib/queries";

import { ChatClient } from "./chat-client";

type PageParams = {
  chatId: string;
};

async function ChatContent({ params }: { params: Promise<PageParams> }) {
  const { chatId } = await params;

  const [chatResult, messagesResult] = await Promise.all([
    getChatById({ id: chatId }),
    getChatMessages({ chatId }),
  ]);

  if (!chatResult.success || !chatResult.data) {
    redirect("/");
  }

  const messages = messagesResult.success ? messagesResult.data : [];

  const formattedMessages = messages.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role,
  }));

  return <ChatClient chatId={chatId} messages={formattedMessages} />;
}

export default function ChatPage({ params }: { params: Promise<PageParams> }) {
  return (
    <main className="flex min-h-0 flex-1 justify-center overflow-hidden">
      <Suspense>
        <ChatContent params={params} />
      </Suspense>
    </main>
  );
}
