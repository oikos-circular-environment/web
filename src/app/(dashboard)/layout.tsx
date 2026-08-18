import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import {
  BreadcrumbProvider,
  DashboardBreadcrumbs,
} from "@/components/dashboard-breadcrumbs/dashboard-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar-cookie";
import { getSession } from "@/libs/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const sidebarDefaultOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <DashboardBreadcrumbs />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
