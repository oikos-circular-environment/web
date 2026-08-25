"use client";

import { animate, cubicBezier } from "animejs";
import { type RefObject, useEffect, useRef, useState } from "react";

import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

import { BEATS, type ShowcaseBeat } from "./beats";
import { DeviceFrame } from "./device-frame";
import { ReportReveal } from "./report-reveal";

const TRANSITION_EASE = cubicBezier(0.4, 0, 0.2, 1);
const REPORT_MAP_BEAT_ID = "report-map";

function BeatStage({
  beat,
  reportMapTrackRef,
}: {
  beat: ShowcaseBeat;
  reportMapTrackRef?: RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState(beat);
  const lastFadeInIdRef = useRef(beat.id);

  useEffect(() => {
    if (beat.id === displayed.id) return;
    const node = containerRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(beat);
      return;
    }

    const currentOpacity = Number(getComputedStyle(node).opacity);
    const animation = animate(node, {
      opacity: [currentOpacity, 0],
      duration: 150,
      ease: TRANSITION_EASE,
      onComplete: () => setDisplayed(beat),
    });

    return () => {
      animation.pause();
    };
  }, [beat, displayed.id]);

  useEffect(() => {
    if (lastFadeInIdRef.current === displayed.id) return;
    lastFadeInIdRef.current = displayed.id;

    const node = containerRef.current;
    if (!node) return;

    const animation = animate(node, {
      opacity: [0, 1],
      duration: 200,
      ease: TRANSITION_EASE,
    });

    return () => {
      animation.pause();
    };
  }, [displayed.id]);

  const ActiveComponent = displayed.Component;

  return (
    <div className="h-full w-full" ref={containerRef}>
      {displayed.id === REPORT_MAP_BEAT_ID && reportMapTrackRef ? (
        <ReportReveal trackRef={reportMapTrackRef} />
      ) : (
        <ActiveComponent />
      )}
    </div>
  );
}

function useActiveBeatIndex(sectionRefs: RefObject<(HTMLElement | null)[]>) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((node, index) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(node);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
    };
  }, [sectionRefs]);

  return activeIndex;
}

function ProductShowcaseContent() {
  const desktopSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const reportMapTrackRef = useRef<HTMLElement | null>(null);
  const desktopActiveIndex = useActiveBeatIndex(desktopSectionRefs);
  const mobileActiveIndex = useActiveBeatIndex(mobileSectionRefs);

  return (
    <Section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center md:text-left">
          <Section.Header>
            <Section.Overline>PRODUTO EM AÇÃO</Section.Overline>
            <Section.Title>Veja como funciona na prática</Section.Title>
          </Section.Header>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            {BEATS.map((beat, index) => (
              <article
                className="flex min-h-[80vh] flex-col justify-center md:min-h-screen"
                data-beat={beat.id}
                key={beat.id}
                ref={(el) => {
                  desktopSectionRefs.current[index] = el;
                  mobileSectionRefs.current[index] = el;
                  if (beat.id === REPORT_MAP_BEAT_ID) {
                    reportMapTrackRef.current = el;
                  }
                }}
              >
                <div className="max-w-md">
                  <Reveal>
                    <h3 className="font-heading text-2xl sm:text-3xl">
                      {beat.title}
                    </h3>
                  </Reveal>

                  <div className="mt-4 flex flex-col gap-4">
                    {beat.topics.map((topic, topicIndex) => (
                      <Reveal
                        key={topic.heading}
                        delay={100 * (topicIndex + 1)}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {topic.heading}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {topic.body}
                        </p>
                      </Reveal>
                    ))}
                  </div>

                  {beat.steps ? (
                    <div className="mt-6 flex flex-col gap-4">
                      {beat.steps.map((step, stepIndex) => (
                        <Reveal
                          key={step.number}
                          delay={100 * (beat.topics.length + stepIndex + 1)}
                          className="flex items-center gap-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B8842A] text-sm font-semibold text-white">
                            {step.number}
                          </div>
                          <p className="text-sm text-foreground">
                            {step.title}
                          </p>
                        </Reveal>
                      ))}
                    </div>
                  ) : null}

                  {beat.cta ? (
                    <Reveal
                      delay={
                        100 *
                        (beat.topics.length + (beat.steps?.length ?? 0) + 1)
                      }
                      className="mt-6"
                    >
                      <GlassButton tone="solid" size="md" asChild>
                        <a href={beat.cta.href}>{beat.cta.label}</a>
                      </GlassButton>
                    </Reveal>
                  ) : null}
                </div>

                <div className="mt-8 flex justify-center md:hidden">
                  <DeviceFrame className="scale-[0.85] sm:scale-100">
                    {index === mobileActiveIndex ? (
                      <BeatStage beat={beat} />
                    ) : null}
                  </DeviceFrame>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-24 flex min-h-[calc(100vh-12rem)] items-center justify-center">
              <DeviceFrame>
                <BeatStage
                  beat={BEATS[desktopActiveIndex] ?? BEATS[0]}
                  reportMapTrackRef={reportMapTrackRef}
                />
              </DeviceFrame>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { ProductShowcaseContent as ProductShowcase };
