"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { AccountMenuButton } from "@/components/account-menu-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/libs/utils";

type NavItem = { href: string; label: string };

export function SiteHeaderMobileNav({ items }: { items: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu de navegação"
        >
          <MenuIcon />
          <span className="sr-only">Abrir menu de navegação</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {items.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "w-full justify-start",
                )}
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <SheetFooter className="flex-row items-center justify-between">
          <AccountMenuButton />
          <ModeToggle />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
