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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import {
  CopyIcon,
  GlobeIcon,
  RefreshCcwIcon,
  ChevronDownIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
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
import { useModels } from "@/hooks/use-models";
import { Button } from "@/components/ui/button";

interface ChatPageProps {
  chatId?: string;
}

export function ChatPage({ chatId: propChatId }: ChatPageProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { models, isLoading: isLoadingModels } = useModels();
  const [userSelectedModelId, setUserSelectedModelId] = useState<string | null>(
    null,
  );
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    propChatId || null,
  );
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const { updateChat, getChat, createChat, fetchChat } =
    useChatHistoryContext();
  const hasInitialized = useRef(false);

  const activeModelId = useMemo(
    () => userSelectedModelId ?? (models.length > 0 ? models[0].id : ""),
    [userSelectedModelId, models],
  );

  const { messages, sendMessage, status, regenerate, setMessages, error } =
    useChat({
      id: currentChatId || undefined,
      onError: (error) => {
        console.error("Chat error:", error);
      },
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
          existingChat = (await fetchChat(propChatId)) || undefined;
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
            model: activeModelId,
            webSearch: webSearch,
          },
        },
      );
      setInput("");
    },
    [currentChatId, createChat, router, sendMessage, activeModelId, webSearch],
  );

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        {isLoadingChat && (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
            Loading chat...
          </div>
        )}
        <Conversation className="h-full">
          <ConversationContent>
            {messages.length == 0 && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Welcome to OpenGPT
                </h2>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask anything to start a conversation. Your chats are saved
                  automatically so you can pick up right where you left off.
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
                            (part) => part.type === "source-url",
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
            {error && (
              <div className="flex flex-col items-center gap-3 p-4 my-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-center max-w-md">
                  {error.message ||
                    "An error occurred while processing your request."}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerate()}
                    className="gap-1"
                  >
                    <RefreshCcwIcon className="size-3" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
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
              <ModelSelector
                open={modelSelectorOpen}
                onOpenChange={setModelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-8 px-3 text-sm font-medium"
                    disabled={isLoadingModels}
                  >
                    {isLoadingModels ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="size-4" />
                        <span className="max-w-32 truncate">
                          {models.find((m) => m.id === activeModelId)?.name ||
                            "Select Model"}
                        </span>
                        <ChevronDownIcon className="size-3 opacity-50" />
                      </>
                    )}
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent title="Free AI Models">
                  <ModelSelectorInput placeholder="Search free models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    <ModelSelectorGroup heading="Free Models">
                      {models.map((m) => (
                        <ModelSelectorItem
                          key={m.id}
                          value={m.id}
                          onSelect={() => {
                            setUserSelectedModelId(m.id);
                            setModelSelectorOpen(false);
                          }}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <ModelSelectorLogo
                            provider={m.provider}
                            className="size-5"
                          />
                          <div className="flex flex-col gap-0.5">
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            {m.contextLength && (
                              <span className="text-xs text-muted-foreground">
                                {(m.contextLength / 1000).toFixed(0)}K context
                              </span>
                            )}
                          </div>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
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
