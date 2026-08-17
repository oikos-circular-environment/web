"use client";

import {
  Building2,
  ChevronsUpDown,
  Megaphone,
  Recycle,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getUserInitials, NavUser } from "@/components/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSessionStore } from "@/stores/use-session-store";

import { TeamSwitcher } from "./team-switcher";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const role = useSessionStore((state) => state.role);

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Serviços</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/market"}
                  tooltip="Pontos de coleta"
                  asChild
                >
                  <a href="/dashboard/market">
                    <Recycle />
                    <span>Pontos de coleta</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/denuncias"}
                  tooltip="Denúncias"
                  asChild
                >
                  <a href="/dashboard/denuncias">
                    <Megaphone />
                    <span>Denúncias</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/empresas"}
                  tooltip="Minhas empresas"
                  asChild
                >
                  <a href="/dashboard/empresas">
                    <Building2 />
                    <span>Minhas empresas</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {role === "moderator" && (
          <SidebarGroup>
            <SidebarGroupLabel>Moderação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/dashboard/moderacao"}
                    tooltip="Usuários"
                    asChild
                  >
                    <a href="/dashboard/moderacao">
                      <ShieldCheck />
                      <span>Usuários</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser
              user={user}
              trigger={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar>
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? user.email}
                    />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.name ?? "Usuário"}
                    </span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
