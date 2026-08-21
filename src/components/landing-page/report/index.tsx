import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

function Report() {
  const steps = [
    {
      number: 1,
      title: "Tire uma foto do local",
    },
    {
      number: 2,
      title: "Confirme a localização (geolocalização automática)",
    },
    {
      number: 3,
      title: "Acompanhe o status até a resolução",
    },
  ];

  return (
    <Section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="text-center">
          <Section.Header className="mx-auto max-w-2xl">
            <Section.Overline>DENÚNCIA CIDADÃ</Section.Overline>
            <Section.Title className="text-2xl sm:text-3xl">
              Viu descarte irregular? Registre em 3 passos.
            </Section.Title>
          </Section.Header>
        </Reveal>

        <div className="mt-12 space-y-6">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={100 * (index + 1)}
              className="flex gap-6"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#B8842A] text-sm font-semibold text-white">
                {step.number}
              </div>
              <div className="flex items-center">
                <p className="text-base text-foreground">{step.title}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400} className="mt-12">
          <Section.Body className="text-center">
            Sua denúncia pode ser encaminhada a órgãos públicos de fiscalização
            — e você acompanha o que acontece com ela, sem ficar no escuro
            depois de enviar.
          </Section.Body>

          <div className="mt-8 flex justify-center">
            <GlassButton tone="solid" size="md" asChild>
              <a href="#denunciar">Fazer uma denúncia</a>
            </GlassButton>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export { Report };
