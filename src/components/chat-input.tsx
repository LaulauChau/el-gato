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

type ActionResult = { success: false; error: TreeifiedError } | void;

type Props = {
  action: (formData: FormData) => Promise<ActionResult>;
  chatId?: string;
  placeholder?: string;
  disabled?: boolean;
};

function extractFirstError(error: TreeifiedError): string {
  const directError = error.errors[0];

  if (directError) {
    return directError;
  }

  const propertyErrors = Object.values(error.properties ?? {});
  const firstPropertyError = propertyErrors[0]?.errors[0];

  if (firstPropertyError) {
    return firstPropertyError;
  }

  return "An error occurred";
}

function buildFormData(text: string, chatId?: string): FormData {
  const formData = new FormData();
  formData.set("messageContent", text);

  if (chatId) {
    formData.set("chatId", chatId);
  }

  return formData;
}

export function ChatInput({ action, chatId, placeholder, disabled }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isInputDisabled = disabled ?? isPending;

  function handleSubmit({ text }: { text: string }) {
    setError(null);

    const formData = buildFormData(text, chatId);

    startTransition(async () => {
      const result = await action(formData);

      if (result && !result.success) {
        setError(extractFirstError(result.error));
      }
    });
  }

  return (
    <PromptInput onSubmit={handleSubmit} className="max-w-2xl">
      <PromptInputTextarea placeholder={placeholder} disabled={isInputDisabled} />
      {error && <p className="px-3 text-sm text-destructive">{error}</p>}
      <PromptInputFooter>
        <span />
        <PromptInputSubmit status={isInputDisabled ? "submitted" : "ready"} />
      </PromptInputFooter>
    </PromptInput>
  );
}
