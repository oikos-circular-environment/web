import { Reveal } from "@/components/landing-page/ui/reveal";
import { Section } from "@/components/landing-page/ui/section";

function Manifesto() {
  return (
    <Section className="bg-background py-16 sm:py-24">
      <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Section.Header>
          <Section.Overline>POR QUE ISSO IMPORTA</Section.Overline>
          <Section.Title className="text-2xl sm:text-3xl">
            Reciclar dá certo quando é fácil saber onde — e quando a gente
            enxerga valor no que sobra.
          </Section.Title>
        </Section.Header>

        <div className="mt-8 space-y-6">
          <Section.Body>
            Aquilo que parece descarte pode ser matéria-prima, renda ou solução
            para outra pessoa. Nem sempre o resíduo vale dinheiro para quem
            separa — mas pode valer para quem coleta, compra, transforma ou
            precisa daquele material.
          </Section.Body>

          <Section.Body>
            A provocação é simples: separar, avisar e encontrar o destino certo
            já muda o caminho do resíduo.
          </Section.Body>
        </div>
      </Reveal>
    </Section>
  );
}

export { Manifesto };
