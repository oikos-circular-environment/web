import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

function Audiences() {
  return (
    <Section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <Section.Header className="mx-auto max-w-2xl">
            <Section.Overline>PRA QUEM É</Section.Overline>
            <Section.Title className="text-2xl sm:text-3xl">
              Um app, dois jeitos de usar.
            </Section.Title>
          </Section.Header>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Reveal delay={100} className="flex h-full">
            <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-8 transition-transform duration-200 hover:-translate-y-2">
              <div>
                <h3 className="font-heading text-lg sm:text-xl">
                  Quero saber pra onde levar meu resíduo
                </h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Mapa de pontos de coleta perto de você, filtrado por tipo de
                material e horário de funcionamento; denúncia de descarte
                irregular com foto e localização.
              </p>

              <div className="mt-auto">
                <GlassButton tone="solid" size="md" asChild>
                  <a href="#baixar">Baixar o app</a>
                </GlassButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className="flex h-full">
            <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-8 transition-transform duration-200 hover:-translate-y-2">
              <div>
                <h3 className="font-heading text-lg sm:text-xl">
                  Tenho um ponto de coleta
                </h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Cadastre horário, serviços oferecidos e tipos de resíduo aceitos
                — apareça pra quem está procurando exatamente o que você recebe.
              </p>

              <div className="mt-auto">
                <GlassButton tone="solid" size="md" asChild>
                  <a href="#cadastrar">Cadastrar meu ponto de coleta</a>
                </GlassButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export { Audiences };
