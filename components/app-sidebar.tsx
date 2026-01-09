"use client";
import { useState, useMemo } from "react";
import { MessageSquare, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { history, groupedHistory, deleteChat, createChat, isLoading } =
    useChatHistoryContext();

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleNewChat = () => {
    const newChatId = createChat();
    router.push(`/chat/${newChatId}`);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat(chatId);
    toast.success("Chat deleted");
    // If we're viewing the deleted chat, redirect to new chat
    if (pathname === `/chat/${chatId}`) {
      router.push("/chat");
    }
  };

  // Get current chat ID from pathname
  const currentChatId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  // Filter history based on search query
  const filteredGroups = useMemo(() => {
    const groups = groupedHistory();
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    const filterGroup = (items: typeof history) =>
      items.filter((chat) => chat.title.toLowerCase().includes(query));

    return {
      today: filterGroup(groups.today),
      yesterday: filterGroup(groups.yesterday),
      lastWeek: filterGroup(groups.lastWeek),
      lastMonth: filterGroup(groups.lastMonth),
      older: filterGroup(groups.older),
    };
  }, [groupedHistory, searchQuery, history]);

  const renderChatGroup = (
    label: string,
    items: typeof history,
    showLabel: boolean = true
  ) => {
    if (items.length === 0) return null;

    return (
      <SidebarGroup key={label}>
        {showLabel && (
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((chat) => (
              <SidebarMenuItem key={chat.id} className="group/item">
                <SidebarMenuButton
                  asChild
                  isActive={currentChatId === chat.id}
                  className="pr-8"
                >
                  <Link href={`/chat/${chat.id}`}>
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  showOnHover
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  const hasHistory =
    filteredGroups.today.length > 0 ||
    filteredGroups.yesterday.length > 0 ||
    filteredGroups.lastWeek.length > 0 ||
    filteredGroups.lastMonth.length > 0 ||
    filteredGroups.older.length > 0;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-1">
          <h1 className="font-semibold text-lg">
            OpenGPT
          </h1>
        </div>
        <div className="flex flex-col gap-2 px-2">
          <Button
            onClick={handleNewChat}
            variant="default"
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background h-9"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground mt-2">Loading chats...</p>
            </div>
          ) : hasHistory ? (
            <>
              {renderChatGroup("Today", filteredGroups.today)}
              {renderChatGroup("Yesterday", filteredGroups.yesterday)}
              {renderChatGroup("Last 7 Days", filteredGroups.lastWeek)}
              {renderChatGroup("Last 30 Days", filteredGroups.lastMonth)}
              {renderChatGroup("Older", filteredGroups.older)}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No chats found" : "No chat history yet"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a new conversation to begin"}
              </p>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button onClick={logout} variant="destructive" className="w-full">
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
