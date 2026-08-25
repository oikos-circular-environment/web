import { Closing } from "@/components/landing-page/closing";
import { Hero } from "@/components/landing-page/hero";
import { Manifesto } from "@/components/landing-page/manifesto";
import { PersonaSelect } from "@/components/landing-page/persona-select";
import { ProductShowcase } from "@/components/landing-page/product-showcase";
import { MockIdentityProvider } from "@/components/landing-page/product-showcase/mock-identity/mock-identity-context";
import { DotField } from "@/components/landing-page/ui/dot-field";
import { GlassButton } from "@/components/landing-page/ui/glass-button";

export default function Home() {
  return (
    <>
      <Hero>
        <Hero.Background />
        <Hero.NavBar />
        <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-6 sm:px-10 lg:px-20">
          <Hero.Content>
            <Hero.Badge>Economia circular de resíduos</Hero.Badge>
            <Hero.Title>Resíduo tem valor. Nós mostramos onde.</Hero.Title>
            <Hero.Subtitle>
              A Oikos conecta quem gera resíduo a quem transforma esse resíduo
              em recurso, com rastreabilidade do início ao fim.
            </Hero.Subtitle>
            <Hero.Actions>
              <GlassButton tone="solid" size="md">
                Começar
              </GlassButton>
              <GlassButton tone="glass" size="md" className="text-foreground">
                Como funciona
              </GlassButton>
            </Hero.Actions>
          </Hero.Content>
        </div>
      </Hero>

      <Manifesto />
      <div className="relative isolate bg-background">
        <DotField />
        <MockIdentityProvider>
          <PersonaSelect />
          <ProductShowcase />
        </MockIdentityProvider>
        <Closing />
      </div>
    </>
  );
}
