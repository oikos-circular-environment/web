"use client";

import { animate, cubicBezier } from "animejs";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

import { DeviceFrame } from "./device-frame";
import { CompanyRegisterScreen } from "./screens/company-register";
import { LoginScreen } from "./screens/login";
import { MapScreen } from "./screens/map";
import { ReportScreen } from "./screens/report";
import { SignUpScreen } from "./screens/signup";

const screens = [
  {
    id: "login",
    title: "Entrar",
    caption: "Sem burocracia pra começar.",
    Component: LoginScreen,
  },
  {
    id: "signup",
    title: "Cadastro",
    caption: "Seu endereço, seu ponto de partida.",
    Component: SignUpScreen,
  },
  {
    id: "map",
    title: "Mapa",
    caption: "Ache o ponto certo pro seu resíduo.",
    Component: MapScreen,
  },
  {
    id: "company-register",
    title: "Cadastrar ponto de coleta",
    caption: "Sua empresa, visível pra quem procura.",
    Component: CompanyRegisterScreen,
  },
  {
    id: "report",
    title: "Denúncia",
    caption: "Registrou, documentou, foi encaminhado.",
    Component: ReportScreen,
  },
];

const TRANSITION_EASE = cubicBezier(0.4, 0, 0.2, 1);

function PhoneScreen({ activeIndex }: { activeIndex: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayIndex, setDisplayIndex] = useState(activeIndex);
  const lastFadeInRef = useRef(activeIndex);

  useEffect(() => {
    if (activeIndex === displayIndex) return;
    const node = containerRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayIndex(activeIndex);
      return;
    }

    const currentOpacity = Number(getComputedStyle(node).opacity);
    const animation = animate(node, {
      opacity: [currentOpacity, 0],
      duration: 150,
      ease: TRANSITION_EASE,
      onComplete: () => setDisplayIndex(activeIndex),
    });

    return () => {
      animation.pause();
    };
  }, [activeIndex, displayIndex]);

  useEffect(() => {
    if (lastFadeInRef.current === displayIndex) return;
    lastFadeInRef.current = displayIndex;

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
  }, [displayIndex]);

  const ActiveComponent =
    screens[displayIndex]?.Component ?? screens[0].Component;

  return (
    <div className="h-full w-full" ref={containerRef}>
      <ActiveComponent />
    </div>
  );
}

function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

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
  }, []);

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
            {screens.map((screen, index) => (
              <article
                className="flex min-h-[80vh] flex-col justify-center md:min-h-screen"
                data-screen={screen.id}
                key={screen.id}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
              >
                <Reveal className="max-w-md">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl">
                        {screen.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {screen.caption}
                      </p>
                    </div>
                  </div>
                </Reveal>

                <div className="mt-8 flex justify-center md:hidden">
                  <DeviceFrame className="scale-[0.85] sm:scale-100">
                    <PhoneScreen activeIndex={index} />
                  </DeviceFrame>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-24 flex min-h-[calc(100vh-12rem)] items-center justify-center">
              <DeviceFrame>
                <PhoneScreen activeIndex={activeIndex} />
              </DeviceFrame>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { ProductShowcase };
