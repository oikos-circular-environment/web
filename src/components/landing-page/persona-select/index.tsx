import { PersonaPicker } from "@/components/landing-page/product-showcase/mock-identity/persona-picker";
import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

function PersonaSelect() {
  return (
    <Section className="flex min-h-dvh flex-col justify-center bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <Section.Header className="mx-auto max-w-2xl">
            <Section.Overline>ANTES DE COMEÇAR</Section.Overline>
            <Section.Title className="text-2xl sm:text-3xl">
              Um app, papéis diferentes.
            </Section.Title>
            <Section.Body className="mx-auto max-w-xl">
              Escolha quem você quer ser pra continuar — é assim que o app se
              comporta diferente pra cada tipo de pessoa.
            </Section.Body>
          </Section.Header>
        </Reveal>

        <Reveal delay={150} className="mt-12">
          <PersonaPicker />
        </Reveal>
      </div>
    </Section>
  );
}

export { PersonaSelect };
