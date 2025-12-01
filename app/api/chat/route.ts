import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: {
    messages: UIMessage[];
    model: string; 
    webSearch: boolean;
  } = await req.json();

  if (!model) {
    return new Response(JSON.stringify({ error: "Model is required" }), {
      status: 400,
    });
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = streamText({
    model: openrouter(model),
    messages: convertToModelMessages(messages),
    system: "You are a helpful AI assistant.",
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
