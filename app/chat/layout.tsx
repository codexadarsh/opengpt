import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistoryProvider } from "@/contexts/chat-history-context";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChatHistoryProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </ChatHistoryProvider>
  );
};

export default layout;

