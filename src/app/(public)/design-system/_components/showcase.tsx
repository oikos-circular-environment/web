import type { ReactNode } from "react";

import { cn } from "@/libs/utils";

function ShowcaseSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border py-10 first:border-t-0 first:pt-0"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

function ShowcaseBlock({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {title ? (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      ) : null}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ColorSwatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex w-32 flex-col gap-2">
      <div
        className="h-16 w-full rounded-md border border-border"
        style={{ background: `var(${varName})` }}
      />
      <div className="flex flex-col">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{varName}</span>
      </div>
    </div>
  );
}

export { ColorSwatch, ShowcaseBlock, ShowcaseSection };
