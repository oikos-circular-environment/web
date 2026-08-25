import Link from "next/link";
import type * as React from "react";

import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { Reveal } from "@/components/landing-page/ui/reveal";

function Closing() {
  return (
    <Section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="font-heading text-2xl sm:text-3xl">
            Pronto pra dar destino certo ao que sobra?
          </h2>

          <div className="mt-8 flex justify-center">
            <GlassButton tone="solid" size="md" asChild>
              <a href="#cadastrar">Cadastrar meu ponto de coleta</a>
            </GlassButton>
          </div>
        </Reveal>

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
