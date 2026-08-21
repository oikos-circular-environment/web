import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/libs/utils";

const glassPanelVariants = cva("rounded-2xl", {
  variants: {
    tone: {
      dark: "backdrop-blur-[24px] bg-[#171717]/85",
      floating: "backdrop-blur-[10px] shadow-[0_1px_32px_rgba(0,0,0,.35)]",
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
