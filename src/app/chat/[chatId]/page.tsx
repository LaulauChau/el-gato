import { redirect } from "next/navigation";

import { getChatById } from "@/lib/queries";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const chat = await getChatById({ id: chatId });

  if (!chat.success) {
    redirect("/");
  }

  return (
    <main className="grid min-h-svh place-items-center">
      <pre>{JSON.stringify(chat, null, 2)}</pre>
    </main>
  );
}
