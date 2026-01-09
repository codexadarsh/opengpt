"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface ChatHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

export function useChatHistory() {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch history from MongoDB on mount
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/chat/history");
      setHistory(response.data.chats || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setHistory([]);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const createChat = useCallback((id?: string): string => {
    const chatId = id || crypto.randomUUID();
    const newChat: ChatHistoryItem = {
      id: chatId,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    // Optimistically update local state
    setHistory((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      return [newChat, ...filtered];
    });

    // Save to MongoDB (fire and forget for creation, will be updated with first message)
    axios.post("/api/chat/history", {
      chatId,
      title: "New Chat",
      messages: [],
    }).catch(console.error);

    return chatId;
  }, []);

  const updateChat = useCallback(
    async (chatId: string, messages: ChatHistoryItem["messages"]) => {
      const title =
        messages.length > 0 && messages[0].role === "user"
          ? messages[0].content.slice(0, 50) +
            (messages[0].content.length > 50 ? "..." : "")
          : "New Chat";

      // Optimistically update local state
      setHistory((prev) => {
        const existing = prev.find((c) => c.id === chatId);
        if (!existing) {
          const newChat: ChatHistoryItem = {
            id: chatId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages,
          };
          return [newChat, ...prev];
        }

        const updated: ChatHistoryItem = {
          ...existing,
          title,
          updatedAt: new Date().toISOString(),
          messages,
        };

        const filtered = prev.filter((c) => c.id !== chatId);
        return [updated, ...filtered];
      });

      // Save to MongoDB
      try {
        await axios.post("/api/chat/history", {
          chatId,
          title,
          messages,
        });
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    },
    []
  );

  const deleteChat = useCallback(async (chatId: string) => {
    // Optimistically update local state
    setHistory((prev) => prev.filter((c) => c.id !== chatId));

    // Delete from MongoDB
    try {
      await axios.delete(`/api/chat/history?chatId=${chatId}`);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      // Refetch to restore state if delete failed
      fetchHistory();
    }
  }, [fetchHistory]);

  const getChat = useCallback(
    (chatId: string): ChatHistoryItem | undefined => {
      return history.find((c) => c.id === chatId);
    },
    [history]
  );

  const fetchChat = useCallback(async (chatId: string): Promise<ChatHistoryItem | null> => {
    try {
      const response = await axios.get(`/api/chat/history/${chatId}`);
      return response.data.chat || null;
    } catch (error) {
      console.error("Failed to fetch chat:", error);
      return null;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    // Delete all chats one by one
    const deletePromises = history.map((chat) =>
      axios.delete(`/api/chat/history?chatId=${chat.id}`).catch(console.error)
    );
    await Promise.all(deletePromises);
    setHistory([]);
  }, [history]);

  // Group history by date
  const groupedHistory = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: {
      today: ChatHistoryItem[];
      yesterday: ChatHistoryItem[];
      lastWeek: ChatHistoryItem[];
      lastMonth: ChatHistoryItem[];
      older: ChatHistoryItem[];
    } = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    };

    history.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonth) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [history]);

  return {
    history,
    isLoaded,
    isLoading,
    createChat,
    updateChat,
    deleteChat,
    getChat,
    fetchChat,
    clearHistory,
    groupedHistory,
    refetch: fetchHistory,
  };
}
