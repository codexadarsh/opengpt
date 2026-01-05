import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
        </main>
        {children}
      </SidebarProvider>
    </div>
  );
};

export default layout;
