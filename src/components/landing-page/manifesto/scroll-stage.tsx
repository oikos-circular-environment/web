"use client";

import { useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { cn } from "@/libs/utils";

import { MANIFESTO_BEATS } from "./beats";
import { useOverlineReveal, useStageReveal } from "./hooks/use-stage-reveal";
import { ManifestoBackground } from "./manifesto-background";
import { MANIFESTO_STAGES } from "./manifesto-stages";
import { SplitReveal } from "./split-reveal";

const OVERLINE_END_FADE_WINDOW = 0.08;
const PIN_LEAVE_PERCENT =
  ((MANIFESTO_STAGES.totalWeight - 1) / MANIFESTO_STAGES.totalWeight) * 100;

function ScrollStage() {
  const trackRef = useRef<HTMLElement | null>(null);
  const progress = useScrollSync(trackRef, {
    enter: "top top",
    leave: `top ${PIN_LEAVE_PERCENT}%`,
  });
  const beatReveals = useStageReveal(progress);
  const overlineReveal = useOverlineReveal(progress);

  const overlineEndFade =
    progress > 1 - OVERLINE_END_FADE_WINDOW
      ? Math.max(0, (1 - progress) / OVERLINE_END_FADE_WINDOW)
      : 1;

  return (
    <section
      ref={trackRef}
      style={{ height: `${MANIFESTO_STAGES.totalWeight * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <ManifestoBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

        <div
          className="absolute top-8 left-1/2 z-10 -translate-x-1/2"
          style={{ opacity: overlineEndFade }}
        >
          <GlassPanel
            className="absolute inset-0 rounded-full"
            style={{ opacity: overlineReveal.badgeOpacity }}
            tone="floating"
          />
          <SplitReveal
            className="relative px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-landing-muted uppercase"
            progress={overlineReveal.textProgress}
            text="POR QUE O ATO DE RECICLAR IMPORTA?"
          />
        </div>

        {MANIFESTO_BEATS.map((beat, index) => {
          const reveal = beatReveals[index];
          if (!reveal) return null;

          return (
            <div
              className={cn(
                "absolute inset-x-6 bottom-16 transition-opacity duration-150 sm:inset-x-16 sm:bottom-24",
                reveal.beatOpacity <= 0 && "pointer-events-none",
              )}
              key={beat.id}
              style={{ opacity: reveal.beatOpacity }}
            >
              <SplitReveal
                className="max-w-2xl font-heading text-2xl leading-tight text-landing-ink sm:text-4xl"
                progress={reveal.primaryProgress}
                text={beat.primary}
              />

              {beat.secondary ? (
                <SplitReveal
                  className="mt-2 max-w-2xl font-heading text-2xl leading-tight text-landing-ink sm:text-4xl"
                  progress={reveal.secondaryProgress ?? 0}
                  text={beat.secondary}
                />
              ) : null}

              {beat.items ? (
                <div className="mt-4 flex max-w-2xl flex-wrap gap-2">
                  {beat.items.map((item, itemIndex) => (
                    <span
                      className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-landing-ink backdrop-blur-sm sm:text-base"
                      key={item}
                      style={{
                        opacity: reveal.chipOpacities?.[itemIndex] ?? 0,
                        transform: `translateY(${
                          (1 - (reveal.chipOpacities?.[itemIndex] ?? 0)) * 8
                        }px)`,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { ScrollStage };
