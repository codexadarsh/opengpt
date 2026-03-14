"use client";

import React, { createContext, useContext } from "react";
import { useChatHistory, ChatHistoryItem } from "@/hooks/use-chat-history";

interface ChatHistoryContextType {
  history: ChatHistoryItem[];
  isLoaded: boolean;
  isLoading: boolean;
  createChat: (id?: string) => string;
  updateChat: (chatId: string, messages: ChatHistoryItem["messages"]) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => ChatHistoryItem | undefined;
  fetchChat: (chatId: string) => Promise<ChatHistoryItem | null>;
  clearHistory: () => void;
  groupedHistory: () => {
    today: ChatHistoryItem[];
    yesterday: ChatHistoryItem[];
    lastWeek: ChatHistoryItem[];
    lastMonth: ChatHistoryItem[];
    older: ChatHistoryItem[];
  };
  refetch: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

export function ChatHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const chatHistory = useChatHistory();

  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error(
      "useChatHistoryContext must be used within a ChatHistoryProvider"
    );
  }
  return context;
}
