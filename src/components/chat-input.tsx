"use client";

import { useState, useTransition } from "react";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

type TreeifiedError = {
  errors: string[];
  properties?: Record<string, { errors: string[] }>;
};

type Props = {
  action: (formData: FormData) => Promise<{ success: false; error: TreeifiedError } | void>;
  chatId?: string;
  placeholder?: string;
};

export function ChatInput({ action, chatId, placeholder }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit({ text }: { text: string }) {
    setError(null);
    const formData = new FormData();
    formData.set("messageContent", text);

    if (chatId) {
      formData.set("chatId", chatId);
    }

    startTransition(async () => {
      const result = await action(formData);

      if (result && !result.success) {
        const firstError =
          result.error.errors[0] ??
          Object.values(result.error.properties ?? {})[0]?.errors[0] ??
          "An error occurred";
        setError(firstError);
      }
    });
  }

  return (
    <PromptInput onSubmit={handleSubmit} className="max-w-2xl">
      <PromptInputTextarea placeholder={placeholder} />
      {error ? <p className="px-3 text-sm text-destructive">{error}</p> : null}
      <PromptInputFooter>
        <span />
        <PromptInputSubmit status={isPending ? "submitted" : "ready"} />
      </PromptInputFooter>
    </PromptInput>
  );
}
