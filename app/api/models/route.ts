import { NextResponse } from "next/server";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
}

export interface FreeModel {
  id: string;
  name: string;
  description?: string;
  provider: string;
  contextLength?: number;
}

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const models: OpenRouterModel[] = data.data || [];

    // Filter only free models (prompt and completion pricing are both "0")
    const freeModels: FreeModel[] = models
      .filter((model) => {
        const promptPrice = parseFloat(model.pricing.prompt);
        const completionPrice = parseFloat(model.pricing.completion);
        return promptPrice === 0 && completionPrice === 0;
      })
      .map((model) => {
        // Extract provider from model ID (e.g., "google/gemini-2.0-flash-exp:free" -> "google")
        const provider = model.id.split("/")[0] || "unknown";
        
        return {
          id: model.id,
          name: model.name,
          description: model.description,
          provider: provider,
          contextLength: model.context_length,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ models: freeModels });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
