"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { useRouter, useParams } from "next/navigation";

const models = [
  {
    name: "grok-4.1-fast",
    value: "x-ai/grok-4.1-fast",
  },
  {
    name: "kat-coder-pro",
    value: "kwaipilot/kat-coder-pro:free",
  },
  {
    name: "GPT-OSS 20B",
    value: "openai/gpt-oss-20b:free",
  },
  {
    name: "gemini-2.0-flash",
    value: "google/gemini-2.0-flash-exp:free",
  },
  {
    name: "qwen-3-coder",
    value: "qwen/qwen3-coder:free",
  },
  { name: "gemma-3-27b", value: "google/gemma-3-27b-it:free" },
];

interface ChatPageProps {
  chatId?: string;
}

export function ChatPage({ chatId: propChatId }: ChatPageProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    propChatId || null
  );
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const { updateChat, getChat, createChat, fetchChat } = useChatHistoryContext();
  const hasInitialized = useRef(false);

  const { messages, sendMessage, status, regenerate, setMessages } = useChat({
    id: currentChatId || undefined,
  });

  // Load existing chat messages if chatId is provided
  useEffect(() => {
    const loadChat = async () => {
      if (propChatId && !hasInitialized.current) {
        hasInitialized.current = true;
        setIsLoadingChat(true);
        setCurrentChatId(propChatId);

        // Try to get from local cache first
        let existingChat = getChat(propChatId);

        // If not in cache, fetch from MongoDB
        if (!existingChat) {
          existingChat = await fetchChat(propChatId) || undefined;
        }

        if (existingChat && existingChat.messages.length > 0) {
          // Convert stored messages to the format expected by useChat
          const formattedMessages = existingChat.messages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            parts: [{ type: "text" as const, text: msg.content }],
          }));
          setMessages(formattedMessages);
        }
        setIsLoadingChat(false);
      }
    };

    loadChat();
  }, [propChatId, getChat, fetchChat, setMessages]);

  // Save messages to history whenever they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const simplifiedMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content:
          msg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("") || "",
      }));
      updateChat(currentChatId, simplifiedMessages);
    }
  }, [messages, currentChatId, updateChat]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);
      if (!(hasText || hasAttachments)) {
        return;
      }

      // Create a new chat ID if this is the first message
      let chatIdToUse = currentChatId;
      if (!chatIdToUse) {
        chatIdToUse = createChat();
        setCurrentChatId(chatIdToUse);
        // Update URL to include chat ID
        router.replace(`/chat/${chatIdToUse}`, { scroll: false });
      }

      sendMessage(
        {
          text: message.text || "Sent with attachments",
          files: message.files,
        },
        {
          body: {
            model: model,
            webSearch: webSearch,
          },
        }
      );
      setInput("");
    },
    [currentChatId, createChat, router, sendMessage, model, webSearch]
  );

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to OpenGPT
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start a conversation by typing a message below. Your chat
                  history will be saved automatically.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url"
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
                              <MessageActions>
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                        </Message>
                      );
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {models.map((model) => (
                    <PromptInputSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

const ChatBotDemo = () => {
  return <ChatPage />;
};

export default ChatBotDemo;

