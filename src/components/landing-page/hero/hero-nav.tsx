import { GlassButton } from "@/components/landing-page/ui/glass-button";

function HeroNav() {
  return (
    <nav
      data-slot="hero-nav"
      className="hero-rise relative z-10 flex h-12 w-full items-center justify-between px-6 md:px-10"
    >
      <span className="text-sm font-medium tracking-[-0.02em] text-landing-ink">
        Oikos
      </span>
      <GlassButton tone="glass" size="sm">
        Entrar
      </GlassButton>
    </nav>
  );
}

export { HeroNav };
