import type { Metadata } from "next";

import { DataDisplaySection } from "./_sections/data-display";
import { FeedbackSection } from "./_sections/feedback";
import { FormsSection } from "./_sections/forms";
import { FoundationsSection } from "./_sections/foundations";
import { MapSection } from "./_sections/map";
import { NavigationSection } from "./_sections/navigation";
import { OverlaysSection } from "./_sections/overlays";

export const metadata: Metadata = {
  title: "Design System",
  description: "Vitrine viva dos componentes e tokens visuais da Oikos.",
  robots: { index: false, follow: false },
};

const TOC = [
  { id: "fundamentos", label: "Fundamentos" },
  { id: "formularios", label: "Formulários" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "navegacao", label: "Navegação" },
  { id: "dados", label: "Exibição de dados" },
  { id: "mapa", label: "Mapa" },
];

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-12">
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Design System
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Vitrine viva dos componentes e tokens visuais da Oikos — "Circular
          Warmth". A especificação completa está em{" "}
          <a href="/design.md" className="underline underline-offset-4">
            /design.md
          </a>
          .
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <FoundationsSection />
      <FormsSection />
      <FeedbackSection />
      <OverlaysSection />
      <NavigationSection />
      <DataDisplaySection />
      <MapSection />
    </div>
  );
}
