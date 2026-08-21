import type * as React from "react";
import { HeroRippleReveal } from "@/components/landing-page/hero-ripple-reveal";
import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { cn } from "@/libs/utils";

import { HeroEntrance } from "./hero-entrance";
import { HeroNav } from "./hero-nav";

function Hero({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="hero"
      className={cn(
        "relative flex h-screen min-h-screen w-full flex-col overflow-hidden",
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
      <HeroRippleReveal
        pristineSrc="/hero/pristine.webp"
        degradedSrc="/hero/degraded.webp"
        alt="Paisagem natural intacta, representando o valor do recurso antes de virar resíduo"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50" />
    </div>
  );
}

function HeroBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassPanel
      data-slot="hero-badge"
      tone="floating"
      className={cn(
        "hero-rise rounded-full px-4 py-1.5 text-sm tracking-[-0.02em] text-landing-muted",
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
        "hero-rise max-w-3xl text-4xl leading-[1.3] font-normal tracking-[-0.04em] text-balance text-landing-ink md:text-5xl lg:text-[56px]",
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
        "hero-rise max-w-xl text-sm leading-[21px] tracking-[-0.02em] text-landing-muted",
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
Hero.Nav = HeroNav;
Hero.Badge = HeroBadge;
Hero.Title = HeroTitle;
Hero.Subtitle = HeroSubtitle;
Hero.Actions = HeroActions;

export {
  Hero,
  HeroActions,
  HeroBackground,
  HeroBadge,
  HeroNav,
  HeroSubtitle,
  HeroTitle,
};
