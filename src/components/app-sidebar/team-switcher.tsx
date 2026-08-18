"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSessionStore } from "@/stores/use-session-store";

function OrganizationLogo() {
  return (
    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
      <Building2 className="size-4" />
    </div>
  );
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const organizations = useSessionStore((state) => state.organizations);
  const activeOrganizationId = useSessionStore(
    (state) => state.activeOrganizationId,
  );
  const setActiveOrganizationId = useSessionStore(
    (state) => state.setActiveOrganizationId,
  );

  if (organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            asChild
            tooltip="Criar organização"
            className="flex items-center justify-center bg-secondary text-secondary-foreground ring-1 ring-primary/40 hover:bg-accent hover:text-accent-foreground"
          >
            <Link href="/dashboard/organizacoes/nova">
              <Plus className="size-4" />
              <span className="truncate font-medium group-data-[collapsible=icon]:hidden">
                Criar organização
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const activeOrganization =
    organizations.find((org) => org.id === activeOrganizationId) ??
    organizations[0];

  if (organizations.length === 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <OrganizationLogo />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrganization.name}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <OrganizationLogo />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrganization.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizações
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setActiveOrganizationId(org.id)}
                className="gap-2 p-2"
              >
                <Building2 className="size-4" />
                <span className="truncate">{org.name}</span>
                {org.id === activeOrganization.id && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
