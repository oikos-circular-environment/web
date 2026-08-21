import { Hero } from "@/components/landing-page/hero";
import { ProductShowcase } from "@/components/landing-page/product-showcase";
import { GlassButton } from "@/components/landing-page/ui/glass-button";

export default function Home() {
  return (
    <>
      <Hero>
        <Hero.Background />
        <Hero.Nav />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <Hero.Badge>Economia circular de resíduos</Hero.Badge>
          <Hero.Title>Resíduo tem valor. Nós mostramos onde.</Hero.Title>
          <Hero.Subtitle>
            A Oikos conecta quem gera resíduo a quem transforma esse resíduo em
            recurso — com rastreabilidade do início ao fim.
          </Hero.Subtitle>
          <Hero.Actions>
            <GlassButton tone="solid" size="md">
              Começar
            </GlassButton>
            <GlassButton tone="glass" size="md">
              Como funciona
            </GlassButton>
          </Hero.Actions>
        </div>
      </Hero>

      <ProductShowcase />
    </>
  );
}
