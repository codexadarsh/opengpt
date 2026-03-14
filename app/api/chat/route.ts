import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 60;

// Models that don't support system prompts
const MODELS_WITHOUT_SYSTEM_PROMPT = [
  "google/gemma-3-4b-it",
  "google/gemma-3-12b-it",
  "google/gemma-3-27b-it",
  "google/gemma-3n-e2b-it",
  "google/gemma-3n-e4b-it",
];

// Helper to extract user-friendly error message
function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Try to parse OpenRouter error format
    const message = error.message;

    // Check for common error patterns
    if (message.includes("No endpoints found")) {
      const modelMatch = message.match(/No endpoints found for ([^.]+)/);
      return modelMatch
        ? `Model "${modelMatch[1]}" is currently unavailable. Please select a different model.`
        : "This model is currently unavailable. Please select a different model.";
    }

    if (message.includes("Provider returned error")) {
      return "The AI provider returned an error. Please try again or select a different model.";
    }

    if (message.includes("rate limit") || message.includes("quota")) {
      return "Rate limit exceeded. Please wait a moment before trying again.";
    }

    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return "Request timed out. The model may be overloaded. Please try again.";
    }

    if (message.includes("Developer instruction is not enabled")) {
      return "This model doesn't support the current configuration. Please try a different model.";
    }

    // Return the original message if no pattern matched
    return message;
  }

  return "An unexpected error occurred. Please try again.";
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
    }: {
      messages: UIMessage[];
      model: string;
    } = await req.json();

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
      });
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
      });
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Check if model supports system prompts
    const modelBase = model.replace(":free", "");
    const supportsSystemPrompt =
      !MODELS_WITHOUT_SYSTEM_PROMPT.includes(modelBase);

    const result = streamText({
      model: openrouter(model),
      messages: convertToModelMessages(messages),
      ...(supportsSystemPrompt && {
        system: "You are a helpful AI assistant.",
      }),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage = parseErrorMessage(error);

    // Return a streaming-compatible error response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: {"type":"start"}\n\n`));
        controller.enqueue(
          encoder.encode(
            `data: {"type":"error","errorText":"${errorMessage.replace(
              /"/g,
              '\\"'
            )}"}\n\n`
          )
        );
        controller.enqueue(encoder.encode(`data: [DONE]\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
