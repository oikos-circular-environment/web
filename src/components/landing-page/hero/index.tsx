import type * as React from "react";
import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { cn } from "@/libs/utils";

import { HeroEntrance } from "./hero-entrance";
import { HeroMapBackground } from "./hero-map-background";
import { HeroNavBar } from "./hero-nav-bar";

function Hero({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="hero"
      className={cn(
        "relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      <HeroEntrance>{children}</HeroEntrance>
    </section>
  );
}

function HeroBackground() {
  return (
    <div data-slot="hero-background" className="absolute inset-0 -z-10">
      <HeroMapBackground />
    </div>
  );
}

function HeroContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassPanel
      data-slot="hero-content"
      tone="dark"
      className={cn(
        "flex max-w-2xl flex-col items-start gap-6 border border-foreground/10 bg-background/35 p-8 text-left sm:p-10",
        className,
      )}
      {...props}
    />
  );
}

function HeroBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassPanel
      data-slot="hero-badge"
      tone="floating"
      className={cn(
        "hero-rise rounded-full bg-background/30 px-4 py-1.5 text-sm tracking-[-0.02em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function HeroTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="hero-title"
      className={cn(
        "hero-rise max-w-3xl text-4xl leading-[1.3] font-normal tracking-[-0.04em] text-balance text-foreground md:text-5xl lg:text-[56px]",
        className,
      )}
      {...props}
    />
  );
}

function HeroSubtitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="hero-subtitle"
      className={cn(
        "hero-rise max-w-xl text-sm leading-[21px] tracking-[-0.02em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function HeroActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-actions"
      className={cn("hero-rise flex flex-wrap items-center gap-3", className)}
      {...props}
    />
  );
}

Hero.Background = HeroBackground;
Hero.NavBar = HeroNavBar;
Hero.Content = HeroContent;
Hero.Badge = HeroBadge;
Hero.Title = HeroTitle;
Hero.Subtitle = HeroSubtitle;
Hero.Actions = HeroActions;

export {
  Hero,
  HeroActions,
  HeroBackground,
  HeroBadge,
  HeroContent,
  HeroNavBar,
  HeroSubtitle,
  HeroTitle,
};
