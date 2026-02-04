import { Mistral } from "@mistralai/mistralai";

import { env } from "@/config/env";

const MODEL_NAME = "mistral-small-latest";

export const mistral = new Mistral({ apiKey: env.MISTRAL_API_KEY });

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function* streamChatCompletion(messages: ChatMessage[]) {
  const stream = await mistral.chat.stream({
    model: MODEL_NAME,
    messages,
  });

  for await (const event of stream) {
    const chunk = event.data.choices[0]?.delta.content;

    if (typeof chunk === "string") {
      yield chunk;
    }
  }
}
