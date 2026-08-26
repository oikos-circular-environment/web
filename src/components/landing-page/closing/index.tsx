import Image from "next/image";
import Link from "next/link";
import type * as React from "react";

import { Reveal } from "@/components/landing-page/ui/reveal";
import { DeviceFan } from "./device-fan";
import { StoreBadges } from "./store-badges";

function Closing() {
  return (
    <Section className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/30 px-10 py-3">
            <Image
              alt="Oikos"
              className="rounded-sm"
              height={30}
              src="/oikos-logo.png"
              width={30}
            />
            <span className="text-lg font-medium">Oikos</span>
          </div>

          <h2 className="mt-6 font-heading text-3xl text-balance sm:text-5xl">
            Pronto pra dar destino certo ao que sobra?
          </h2>

          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Denuncie descarte irregular, encontre pontos de coleta e transforme
            resíduo em recurso, tudo no bolso.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Disponível em
            </span>
            <StoreBadges />
          </div>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <DeviceFan />
      </Reveal>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal delay={100} className="mt-16 border-t border-border pt-12">
          <footer className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-8">
            <Link
              href="/termos-de-uso"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Termos de Uso
            </Link>

            <Link
              href="/politica-de-privacidade"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Política de Privacidade
            </Link>

            <a
              href="mailto:suporte@oikos.company"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              suporte@oikos.company
            </a>
          </footer>
        </Reveal>
      </div>
    </Section>
  );
}

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="section" className={className} {...props} />;
}

export { Closing };
