import { LocateFixed } from "lucide-react";
import { PersonaShowcase } from "@/components/landing-page/product-showcase/mock-identity/persona-showcase";
import { GEOLOCATION } from "@/components/landing-page/product-showcase/mock-identity/personas";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

function GeolocationInput() {
  return (
    <div className="mx-auto mt-6 flex w-full max-w-md items-center gap-3 rounded-full border border-border bg-card/80 py-2 pr-4 pl-2.5 shadow-sm backdrop-blur-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LocateFixed className="size-4" strokeWidth={2.25} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Localização usada nesta prévia
        </span>
        <input
          className="w-full truncate bg-transparent text-sm font-medium text-foreground outline-none"
          readOnly
          value={`${GEOLOCATION.label} · ${GEOLOCATION.latitude.toFixed(4)}, ${GEOLOCATION.longitude.toFixed(4)}`}
        />
      </div>
    </div>
  );
}

function PersonaSelect() {
  return (
    <Section className="flex min-h-dvh flex-col justify-center py-16 sm:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <Section.Header className="mx-auto max-w-2xl">
            <Section.Overline>QUEM VAI USAR</Section.Overline>
            <Section.Title className="text-2xl sm:text-3xl">
              Encontre quem parece com você.
            </Section.Title>
            <Section.Body className="mx-auto max-w-xl">
              Camila, Marcos, Fernanda, Rafael e Juliana usam o app de um jeito
              diferente cada um. Escolha uma pessoa pra ver a experiência dela.
            </Section.Body>
          </Section.Header>

          <GeolocationInput />
        </Reveal>
      </div>

      <Reveal
        className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6"
        delay={150}
      >
        <PersonaShowcase />
      </Reveal>
    </Section>
  );
}

export { PersonaSelect };
