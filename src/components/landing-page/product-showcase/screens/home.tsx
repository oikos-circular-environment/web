"use client";

import { ArrowUpRight, Recycle, RefreshCw, TrendingDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type BadgeItem = {
  icon: typeof Recycle;
  label: string;
};

const BADGE_ITEMS: BadgeItem[] = [
  { icon: RefreshCw, label: "Reuse" },
  { icon: TrendingDown, label: "Reduze" },
  { icon: Recycle, label: "Recicle" },
];

function FloatingGlassBadge() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % BADGE_ITEMS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const item = BADGE_ITEMS[activeIndex];
  const Icon = item.icon;

  return (
    <div className="animate-float self-start rounded-full border border-white/40 bg-white/30 px-3 py-1.5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-700" />
        <span className="text-xs font-bold text-gray-700">{item.label}</span>
      </div>
    </div>
  );
}

type Service = {
  id: string;
  image: string;
  gradientColor: string;
  title: string;
  ctaLabel: string;
  description: string;
};

const SERVICES: Service[] = [
  {
    id: "pontos-de-coleta",
    image: "/device-preview/home/pontos-de-coleta.jpg",
    gradientColor: "#3e6111",
    title: "RECICLAGEM",
    ctaLabel: "Reciclar agora",
    description:
      "Encontre pontos de coleta, coletores e empresas perto de você e dê o destino certo aos seus resíduos!",
  },
  {
    id: "denuncias",
    image: "/device-preview/home/denuncias.jpg",
    gradientColor: "#0d1f33",
    title: "DENÚNCIAS",
    ctaLabel: "Denunciar agora",
    description:
      "Fotografe e localize descarte irregular, acompanhe com a comunidade e ajude a manter o ambiente mais limpo e seguro!",
  },
  {
    id: "empresas",
    image: "/device-preview/home/empresas.jpg",
    gradientColor: "#26241f",
    title: "EMPRESAS",
    ctaLabel: "Cadastrar agora",
    description:
      "Cadastre sua empresa ou ponto de coleta e ganhe visibilidade no Mercado para quem procura destinar resíduos!",
  },
];

const FOOTER_LABELS = ["REDUZA", "REUTILIZE", "RECICLE"];

const AUTOPLAY_INTERVAL_MS = 5000;

function ServicesCarouselSteps({
  items,
  activeIndex,
  progress,
  onSelect,
}: {
  items: Service[];
  activeIndex: number;
  progress: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {items.map((service, index) => (
        <button
          aria-label={service.title}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200"
          key={service.id}
          onClick={() => onSelect(index)}
          type="button"
        >
          {index === activeIndex ? (
            <div
              className="h-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Auto-avanço próprio (não o autoplay embutido do embla): pausa no toque sem
 * reiniciar do zero e retoma do tempo restante, mesmo comportamento do
 * `ServicesCarouselTrack` do mobile (ver context.ts de lá).
 */
function useServicesAutoplay(api: CarouselApi | undefined, itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const isPausedRef = useRef(false);
  const isAdvancingRef = useRef(false);
  const remainingRef = useRef(AUTOPLAY_INTERVAL_MS);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
      isAdvancingRef.current = false;
      remainingRef.current = AUTOPLAY_INTERVAL_MS;
      setProgress(0);
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || itemCount <= 1) return;

    let frameId: number;
    const frame = (now: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = now;
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      if (!isPausedRef.current && !isAdvancingRef.current) {
        remainingRef.current = Math.max(0, remainingRef.current - delta);
        setProgress(1 - remainingRef.current / AUTOPLAY_INTERVAL_MS);

        if (remainingRef.current <= 0) {
          isAdvancingRef.current = true;
          api.scrollNext();
        }
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [api, itemCount]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    lastFrameRef.current = null;
  }, []);

  return { activeIndex, progress, pause, resume };
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg">
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="308px"
        src={service.image}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3/5"
        style={{
          background: `linear-gradient(to top, ${service.gradientColor}, transparent)`,
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-4">
        <p className="text-center font-heading text-2xl font-bold text-white uppercase [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
          {service.title}
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 self-end rounded-lg border border-white/40 bg-black/25 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium text-white">
              {service.ctaLabel}
            </span>
            <ArrowUpRight className="h-3 w-3 text-white" />
          </div>

          <div className="rounded-lg border border-white/30 bg-black/25 p-3 backdrop-blur-sm">
            <p className="text-[11px] leading-snug text-white/90">
              {service.description}
            </p>
          </div>

          <div className="flex items-center justify-between px-0.5">
            {FOOTER_LABELS.map((label) => (
              <span
                className="text-[10px] font-bold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeScreen() {
  const [api, setApi] = useState<CarouselApi>();
  const { activeIndex, progress, pause, resume } = useServicesAutoplay(
    api,
    SERVICES.length,
  );

  const handleSelectStep = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="relative overflow-hidden bg-linear-to-b from-[#f2e6ce] to-white px-5 pt-8 pb-4">
        <div className="relative pb-8">
          <Image
            alt=""
            className="pointer-events-none absolute top-1 -right-8 object-contain"
            height={200}
            src="/device-preview/home/nature.webp"
            width={200}
          />

          <p className="font-heading text-[56px] leading-[0.85] font-bold tracking-wide text-white uppercase [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
            OIKOS
          </p>

          <p className="mt-3 w-36 text-xs leading-4 text-gray-600">
            Denuncie ocorrências ambientais com foto e localização, vote com a
            comunidade e encontre empresas de reciclagem perto de você.
          </p>

          <div className="absolute right-1 bottom-0">
            <FloatingGlassBadge />
          </div>
        </div>

        <button
          className="w-full rounded-full border border-white/50 bg-white/40 px-5 py-3 text-center text-sm font-semibold text-gray-800 backdrop-blur-sm"
          type="button"
        >
          Entrar
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
        <h2 className="font-heading text-lg font-semibold">Serviços</h2>

        <ServicesCarouselSteps
          activeIndex={activeIndex}
          items={SERVICES}
          onSelect={handleSelectStep}
          progress={progress}
        />

        <div onPointerDown={pause} onPointerLeave={resume} onPointerUp={resume}>
          <Carousel opts={{ loop: true }} setApi={setApi}>
            <CarouselContent className="-ml-0">
              {SERVICES.map((service) => (
                <CarouselItem className="basis-full pl-0" key={service.id}>
                  <ServiceCard service={service} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export { HomeScreen };
