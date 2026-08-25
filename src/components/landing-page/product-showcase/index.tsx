"use client";

import { animate, cubicBezier } from "animejs";
import { type RefObject, useEffect, useRef, useState } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

import { BEATS, type ShowcaseBeat } from "./beats";
import { CompanyRegistrationReveal } from "./company-registration-reveal";
import { DeviceFrame } from "./device-frame";
import { HomeReveal } from "./home-reveal";
import { PontosDeColetaReveal } from "./pontos-de-coleta-reveal";
import { ProfileReveal } from "./profile-reveal";
import { ReportReveal } from "./report-reveal";

const TRANSITION_EASE = cubicBezier(0.4, 0, 0.2, 1);
const REPORT_MAP_BEAT_ID = "report-map";
const HOME_BEAT_ID = "home";
const PROFILE_BEAT_ID = "profile";
const COMPANY_REGISTRATION_BEAT_ID = "company-registration";
const PONTOS_DE_COLETA_BEAT_ID = "pontos-de-coleta";
const TEXT_SETTLE_AT = 0.18;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function BeatStage({
  beat,
  trackRefs,
}: {
  beat: ShowcaseBeat;
  trackRefs: Record<string, RefObject<HTMLElement | null>>;
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

  const trackRef = trackRefs[displayed.id];

  return (
    <div className="h-full w-full" ref={containerRef}>
      {displayed.id === REPORT_MAP_BEAT_ID && trackRef ? (
        <ReportReveal trackRef={trackRef} />
      ) : displayed.id === HOME_BEAT_ID && trackRef ? (
        <HomeReveal trackRef={trackRef} />
      ) : displayed.id === PROFILE_BEAT_ID && trackRef ? (
        <ProfileReveal trackRef={trackRef} />
      ) : displayed.id === COMPANY_REGISTRATION_BEAT_ID && trackRef ? (
        <CompanyRegistrationReveal trackRef={trackRef} />
      ) : displayed.id === PONTOS_DE_COLETA_BEAT_ID && trackRef ? (
        <PontosDeColetaReveal trackRef={trackRef} />
      ) : (
        <displayed.Component />
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

function BeatArticle({
  beat,
  index,
  isMobileActive,
  trackRefs,
  registerRef,
}: {
  beat: ShowcaseBeat;
  index: number;
  isMobileActive: boolean;
  trackRefs: Record<string, RefObject<HTMLElement | null>>;
  registerRef: (index: number, el: HTMLElement | null) => void;
}) {
  const trackRef = useRef<HTMLElement | null>(null);
  const rawProgress = useScrollSync(trackRef);
  const progress = Math.min(rawProgress / TEXT_SETTLE_AT, 1);

  const itemCount = beat.topics.length + (beat.steps?.length ?? 0);
  const itemOpacity = (itemIndex: number) => {
    if (itemCount === 0) return 1;
    const start = itemIndex / itemCount;
    const end = (itemIndex + 1) / itemCount;
    return clamp01((progress - start) / (end - start));
  };

  return (
    <article
      className="flex min-h-[80vh] flex-col justify-center md:min-h-screen"
      data-beat={beat.id}
      ref={(el) => {
        trackRef.current = el;
        registerRef(index, el);
      }}
    >
      <div className="max-w-md">
        <Reveal>
          <h3 className="font-heading text-2xl sm:text-3xl">{beat.title}</h3>
        </Reveal>

        <GlassPanel className="mt-4 flex flex-col gap-4 p-6" tone="light">
          {beat.topics.map((topic, topicIndex) => (
            <div
              key={topic.heading}
              style={{
                opacity: itemOpacity(topicIndex),
                transform: `translateY(${(1 - itemOpacity(topicIndex)) * 8}px)`,
                transition: "opacity 300ms, transform 300ms",
              }}
            >
              <p className="text-sm font-semibold text-foreground">
                {topic.heading}
              </p>
              <p className="text-sm text-muted-foreground">{topic.body}</p>
            </div>
          ))}

          {beat.steps?.map((step, stepIndex) => {
            const stepItemIndex = beat.topics.length + stepIndex;
            return (
              <div
                key={step.number}
                style={{
                  opacity: itemOpacity(stepItemIndex),
                  transform: `translateY(${(1 - itemOpacity(stepItemIndex)) * 8}px)`,
                  transition: "opacity 300ms, transform 300ms",
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  {step.title}
                </p>
              </div>
            );
          })}
        </GlassPanel>

        {beat.cta ? (
          <Reveal className="mt-6" delay={100 * (itemCount + 1)}>
            <GlassButton tone="solid" size="md" asChild>
              <a href={beat.cta.href}>{beat.cta.label}</a>
            </GlassButton>
          </Reveal>
        ) : null}
      </div>

      <div className="mt-8 flex justify-center md:hidden">
        <DeviceFrame className="scale-[0.85] sm:scale-100">
          {isMobileActive ? (
            <BeatStage beat={beat} trackRefs={trackRefs} />
          ) : null}
        </DeviceFrame>
      </div>
    </article>
  );
}

function ProductShowcaseContent() {
  const desktopSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const trackRefs = useRef<Record<string, RefObject<HTMLElement | null>>>({
    [HOME_BEAT_ID]: { current: null },
    [PROFILE_BEAT_ID]: { current: null },
    [COMPANY_REGISTRATION_BEAT_ID]: { current: null },
    [PONTOS_DE_COLETA_BEAT_ID]: { current: null },
    [REPORT_MAP_BEAT_ID]: { current: null },
  });
  const desktopActiveIndex = useActiveBeatIndex(desktopSectionRefs);
  const mobileActiveIndex = useActiveBeatIndex(mobileSectionRefs);

  const trackRefsValue = trackRefs.current;

  return (
    <Section className="py-16 sm:py-24">
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
              <BeatArticle
                beat={beat}
                index={index}
                isMobileActive={index === mobileActiveIndex}
                key={beat.id}
                registerRef={(itemIndex, el) => {
                  desktopSectionRefs.current[itemIndex] = el;
                  mobileSectionRefs.current[itemIndex] = el;
                  const ref = trackRefsValue[beat.id];
                  if (ref) {
                    ref.current = el;
                  }
                }}
                trackRefs={trackRefsValue}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-24 flex min-h-[calc(100vh-12rem)] items-center justify-center">
              <DeviceFrame>
                <BeatStage
                  beat={BEATS[desktopActiveIndex] ?? BEATS[0]}
                  trackRefs={trackRefsValue}
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
