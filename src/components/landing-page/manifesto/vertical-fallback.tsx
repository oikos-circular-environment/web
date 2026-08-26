import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

import { MANIFESTO_BEATS } from "./beats";
import { ManifestoBackground } from "./manifesto-background";

function VerticalFallback() {
  return (
    <div>
      {MANIFESTO_BEATS.map((beat, index) => (
        <div
          className="relative flex h-screen w-full items-end overflow-hidden"
          key={beat.id}
        >
          <ManifestoBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

          <Reveal className="relative z-10 flex w-full flex-col gap-4 px-6 pb-16 sm:px-16 sm:pb-24">
            {index === 0 ? (
              <GlassPanel
                className="w-fit rounded-full px-4 py-1.5"
                tone="floating"
              >
                <Section.Overline className="text-landing-muted">
                  POR QUE O ATO DE RECICLAR IMPORTA?
                </Section.Overline>
              </GlassPanel>
            ) : null}

            <p className="max-w-2xl font-heading text-2xl leading-tight text-landing-ink sm:text-4xl">
              {beat.primary}
            </p>

            {beat.secondary ? (
              <p className="max-w-2xl font-heading text-2xl leading-tight text-landing-ink sm:text-4xl">
                {beat.secondary}
              </p>
            ) : null}

            {beat.items ? (
              <div className="flex max-w-2xl flex-wrap gap-2">
                {beat.items.map((item) => (
                  <span
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-landing-ink backdrop-blur-sm sm:text-base"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      ))}
    </div>
  );
}

export { VerticalFallback };
