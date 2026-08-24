type ManifestoBeat = {
  id: string;
  primary: string;
  secondary?: string;
  items?: string[];
};

const MANIFESTO_BEATS: ManifestoBeat[] = [
  {
    id: "onde-valor",
    primary:
      "Reciclar fica fácil quando nos conectamos com pessoas que têm o mesmo propósito e enxergam valor na ação e na capacidade de transformar o resíduo em algo útil novamente.",
  },
  {
    id: "materia-prima",
    primary: "Aquilo que parece lixo para uns, para outros é",
    items: ["matéria-prima", "renda", "solução para outra pessoa"],
  },
  {
    id: "quem-precisa",
    primary:
      "Nem sempre o resíduo vale dinheiro para quem gera, mas pode valer para quem",
    items: ["coleta", "compra", "transforma", "precisa daquele material"],
  },
  {
    id: "fechamento",
    primary:
      "Você não precisa resolver o problema inteiro sózinho. Apenas a sua parte:",
    items: ["higienize", "separe", "destine"],
  },
];

const MANIFESTO_BACKGROUND = {
  videoSrc: undefined as string | undefined,
  posterSrc: undefined as string | undefined,
  alt: "Fluxo contínuo de um resíduo encontrando seu destino certo",
};

export type { ManifestoBeat };
export { MANIFESTO_BACKGROUND, MANIFESTO_BEATS };
