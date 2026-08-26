import Image from "next/image";
import Link from "next/link";

import { AccountMenuButton } from "@/components/account-menu-button";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteHeaderMobileNav } from "@/components/site-header-mobile-nav";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/libs/utils";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/suporte", label: "Suporte" },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-semibold"
          >
            <Image
              src="/oikos-logo.png"
              alt="Oikos"
              width={28}
              height={28}
              className="rounded-sm"
            />
            Oikos
          </Link>
        </div>
        <div className="hidden md:flex">
          <NavigationMenu viewport={false} className="max-w-full">
            <NavigationMenuList className="flex-wrap justify-center">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <AccountMenuButton />
            <ModeToggle />
          </div>
          <SiteHeaderMobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
