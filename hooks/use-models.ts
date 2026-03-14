"use client";

import { useState, useEffect, useCallback } from "react";

export interface Model {
  id: string;
  name: string;
  description?: string;
  provider: string;
  contextLength?: number;
}

interface UseModelsReturn {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Fallback free models in case API fails
const FALLBACK_MODELS: Model[] = [
  {
    id: "google/gemma-3-4b-it:free",
    name: "Gemma 3 4B",
    provider: "google",
  },
  {
    id: "google/gemma-3-12b-it:free",
    name: "Gemma 3 12B",
    provider: "google",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "google",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B",
    provider: "meta-llama",
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral Small 3.1 24B",
    provider: "mistralai",
  },
];

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<Model[]>(FALLBACK_MODELS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/models");
      
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      
      if (data.models && data.models.length > 0) {
        setModels(data.models);
      } else {
        // Use fallback if no models returned
        setModels(FALLBACK_MODELS);
      }
    } catch (err) {
      console.error("Error fetching models:", err);
      setError(err instanceof Error ? err.message : "Failed to load models");
      // Keep fallback models on error
      setModels(FALLBACK_MODELS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    isLoading,
    error,
    refetch: fetchModels,
  };
}
