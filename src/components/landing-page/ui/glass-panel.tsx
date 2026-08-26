import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/libs/utils";

const glassPanelVariants = cva("rounded-2xl", {
  variants: {
    tone: {
      dark: "backdrop-blur-[24px] bg-background/85",
      floating: "backdrop-blur-[10px] shadow-[0_1px_32px_rgba(0,0,0,.35)]",
      light:
        "border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_45%,rgba(255,255,255,0.24)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl",
    },
  },
  defaultVariants: {
    tone: "dark",
  },
});

function GlassPanel({
  className,
  tone = "dark",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof glassPanelVariants>) {
  return (
    <div
      data-slot="glass-panel"
      data-tone={tone}
      className={cn(glassPanelVariants({ tone, className }))}
      {...props}
    />
  );
}

export { GlassPanel, glassPanelVariants };
