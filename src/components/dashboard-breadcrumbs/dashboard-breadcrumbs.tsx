"use client";

import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useRef, useState } from "react";

import { NAV_GROUPS } from "@/components/app-sidebar/nav-items";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  type BreadcrumbMenuItem,
  useBreadcrumbOverrides,
} from "./breadcrumb-context";

export {
  BreadcrumbProvider,
  useBreadcrumbItems,
  useBreadcrumbLabel,
} from "./breadcrumb-context";

const SUPPLEMENTAL_ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Painel",
  "/dashboard/account": "Conta",
  "/dashboard/profile": "Perfil",
  "/dashboard/organizacoes": "Organizações",
  "/dashboard/organizacoes/nova": "Nova organização",
};

// segmentos que existem só como estrutura de rota, sem page.tsx próprio
const NON_LINKABLE_ROUTES = new Set<string>(["/dashboard/organizacoes"]);

const NAV_ROUTE_LABELS: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.url, item.title] as const),
  ),
);

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

type Crumb = {
  href: string;
  label: string;
  linkable: boolean;
  items?: BreadcrumbMenuItem[];
};

function buildCrumbs(
  pathname: string,
  overrides: ReturnType<typeof useBreadcrumbOverrides>,
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  let accumulated = "";
  return segments.map((segment) => {
    accumulated += `/${segment}`;
    const override = overrides[accumulated];
    const label =
      override?.label ??
      NAV_ROUTE_LABELS[accumulated] ??
      SUPPLEMENTAL_ROUTE_LABELS[accumulated] ??
      humanizeSegment(segment);
    return {
      href: accumulated,
      label,
      linkable: !NON_LINKABLE_ROUTES.has(accumulated),
      items: override?.items,
    };
  });
}

function BreadcrumbSwitcher({
  crumb,
}: {
  crumb: Crumb & { items: BreadcrumbMenuItem[] };
}) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function openNow() {
    clearTimeout(closeTimeout.current);
    setOpen(true);
  }

  function closeSoon() {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: groups a link and a menu trigger inline; <fieldset> would force browser default styling.
    <span
      role="group"
      className="inline-flex items-center gap-0.5"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <BreadcrumbLink asChild>
        <Link href={crumb.href}>{crumb.label}</Link>
      </BreadcrumbLink>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Trocar ${crumb.label}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDownIcon className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          {crumb.items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const overrides = useBreadcrumbOverrides();
  const crumbs = buildCrumbs(pathname, overrides);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const hasSwitcher = !isLast && crumb.items && crumb.items.length > 1;

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : hasSwitcher ? (
                  <BreadcrumbSwitcher
                    crumb={crumb as Crumb & { items: BreadcrumbMenuItem[] }}
                  />
                ) : crumb.linkable ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
