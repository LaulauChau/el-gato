import { IconMessage } from "@tabler/icons-react";

import { ChatInput } from "@/components/chat-input";
import { createNewChat } from "@/lib/actions";

export default function RootPage() {
  return (
    <main className="flex h-svh flex-col items-center overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="text-muted-foreground">
          <IconMessage className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Welcome to El Gato</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by typing a message below.
          </p>
        </div>
      </div>
      <div className="w-full max-w-2xl shrink-0 pb-4">
        <ChatInput action={createNewChat} placeholder="Start a new chat..." />
      </div>
    </main>
  );
}
