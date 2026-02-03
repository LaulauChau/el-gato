import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { createNewMessage } from "@/lib/actions";
import { getChatById, getChatMessages } from "@/lib/queries";

async function ChatContent({ chatId }: { chatId: string }) {
  const [chat, messagesResult] = await Promise.all([
    getChatById({ id: chatId }),
    getChatMessages({ chatId }),
  ]);

  if (!chat.success || !chat.data) {
    redirect("/");
  }

  const messages = messagesResult.success ? messagesResult.data : [];

  return (
    <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden">
      <ChatMessages messages={messages} />
      <div className="shrink-0 pb-4">
        <ChatInput action={createNewMessage} chatId={chatId} placeholder="Send a message..." />
      </div>
    </div>
  );
}

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  return (
    <main className="flex min-h-0 flex-1 justify-center overflow-hidden">
      <Suspense>
        <ChatContent chatId={chatId} />
      </Suspense>
    </main>
  );
}
