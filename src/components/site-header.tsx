import Image from "next/image";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { SiteHeaderMobileNav } from "@/components/site-header-mobile-nav";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/design-system", label: "Design System" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/suporte", label: "Suporte" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
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
        <div className="hidden items-center gap-2 md:flex">
          <NavigationMenu viewport={false} className="max-w-full">
            <NavigationMenuList className="flex-wrap justify-end">
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
          <ModeToggle />
        </div>
        <SiteHeaderMobileNav items={navItems} />
      </div>
    </header>
  );
}
