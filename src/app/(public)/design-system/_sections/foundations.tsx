import {
  ColorSwatch,
  ShowcaseBlock,
  ShowcaseSection,
} from "../_components/showcase";

const CORES_BASE = [
  { name: "Background", varName: "--background" },
  { name: "Foreground", varName: "--foreground" },
  { name: "Card", varName: "--card" },
  { name: "Popover", varName: "--popover" },
  { name: "Primary", varName: "--primary" },
  { name: "Secondary", varName: "--secondary" },
  { name: "Muted", varName: "--muted" },
  { name: "Accent", varName: "--accent" },
  { name: "Destructive", varName: "--destructive" },
  { name: "Border", varName: "--border" },
  { name: "Input", varName: "--input" },
  { name: "Ring", varName: "--ring" },
];

const CORES_CATEGORIA = [
  { name: "Papel", varName: "--chart-1" },
  { name: "Plástico", varName: "--chart-2" },
  { name: "Metal", varName: "--chart-3" },
  { name: "Vidro", varName: "--chart-4" },
  { name: "Orgânico", varName: "--chart-5" },
];

const ESPACAMENTO = [4, 8, 12, 16, 20, 24, 32, 40];
const RADIUS = [
  { name: "sm", varName: "--radius-sm" },
  { name: "md", varName: "--radius-md" },
  { name: "lg", varName: "--radius-lg" },
  { name: "xl", varName: "--radius-xl" },
  { name: "2xl", varName: "--radius-2xl" },
];

export function FoundationsSection() {
  return (
    <ShowcaseSection
      id="fundamentos"
      title="Fundamentos"
      description="Tokens de cor, tipografia, espaçamento e radius definidos em DESIGN.md (Circular Warmth)."
    >
      <ShowcaseBlock title="Cores base">
        {CORES_BASE.map((c) => (
          <ColorSwatch key={c.varName} {...c} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock title="Cores por categoria de resíduo (chart-1 … chart-5)">
        {CORES_CATEGORIA.map((c) => (
          <ColorSwatch key={c.varName} {...c} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock title="Tipografia" className="flex-col items-start gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-4xl font-bold">
            Display / H1 — Oswald
          </span>
          <span className="text-xs text-muted-foreground">
            font-heading · 700
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-heading text-2xl font-semibold">
            H2 — Oswald
          </span>
          <span className="text-xs text-muted-foreground">
            font-heading · 600
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base">Corpo padrão — Space Grotesk</span>
          <span className="text-xs text-muted-foreground">font-sans · 400</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            Corpo secundário / caption — Space Grotesk
          </span>
          <span className="text-xs text-muted-foreground">
            font-sans · muted-foreground
          </span>
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock title="Espaçamento (base 8px)">
        {ESPACAMENTO.map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className="bg-primary" style={{ width: s, height: s }} />
            <span className="text-xs text-muted-foreground">{s}px</span>
          </div>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock title="Radius">
        {RADIUS.map((r) => (
          <div key={r.varName} className="flex flex-col items-center gap-2">
            <div
              className="size-16 border-2 border-primary bg-primary/10"
              style={{ borderRadius: `var(${r.varName})` }}
            />
            <span className="text-xs text-muted-foreground">{r.name}</span>
          </div>
        ))}
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}
