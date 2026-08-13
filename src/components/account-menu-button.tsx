"use client";

import { ChevronDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { getUserInitials, NavUser } from "@/components/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionStore } from "@/stores/use-session-store";

export function AccountMenuButton() {
  const user = useSessionStore((state) => state.user);
  const sessionResolved = useSessionStore((state) => state.sessionResolved);

  if (!sessionResolved) {
    return <Skeleton className="h-9 w-24 rounded-md" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/registro">Registrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center rounded-md border border-transparent transition-colors hover:bg-muted hover:text-foreground focus-within:ring-3 focus-within:ring-ring/50 dark:hover:bg-muted/50">
      <Link
        href="/dashboard"
        aria-label="Ir para o dashboard"
        className="flex h-9 items-center gap-2 px-2"
      >
        <LayoutDashboard className="size-4" />
        <Avatar size="sm">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? user.email}
          />
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
      </Link>
      <NavUser
        user={user}
        trigger={
          <button
            type="button"
            aria-label="Abrir menu da conta"
            className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className="size-4" />
          </button>
        }
      />
    </div>
  );
}
