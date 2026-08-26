import type * as React from "react";

import { cn } from "@/libs/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn("relative w-full", className)}
      {...props}
    />
  );
}

function SectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-header"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function SectionOverline({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-overline"
      className={cn(
        "text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="section-title"
      className={cn(
        "font-heading text-3xl leading-tight sm:text-4xl",
        className,
      )}
      {...props}
    />
  );
}

function SectionBody({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-body"
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  );
}

Section.Header = SectionHeader;
Section.Overline = SectionOverline;
Section.Title = SectionTitle;
Section.Body = SectionBody;

export { Section, SectionBody, SectionHeader, SectionOverline, SectionTitle };
