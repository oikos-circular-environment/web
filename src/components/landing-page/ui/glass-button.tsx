import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/libs/utils";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        glass:
          "backdrop-blur-[5px] bg-white/10 text-landing-ink hover:bg-white/[0.16]",
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        sm: "h-8 px-4 text-sm",
        md: "h-9 px-6 text-sm",
      },
    },
    defaultVariants: {
      tone: "glass",
      size: "md",
    },
  },
);

function GlassButton({
  className,
  tone = "glass",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof glassButtonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="glass-button"
      data-tone={tone}
      data-size={size}
      className={cn(glassButtonVariants({ tone, size, className }))}
      {...props}
    />
  );
}

export { GlassButton, glassButtonVariants };
