type HeroMapLocation = {
  id: string;
  name: string;
  kind: string;
  longitude: number;
  latitude: number;
  address: string;
  hours: string;
  phone: string;
  wasteTypes: string[];
};

/**
 * Mock — mesma cidade (Rondonópolis, MT) usada nas telas de Pontos de coleta
 * do device-preview, até termos a integração real com a API de mercado.
 */
const HERO_MAP_LOCATIONS: HeroMapLocation[] = [
  {
    id: "recicla-rondonopolis",
    name: "Recicla Rondonópolis",
    kind: "Cooperativa de reciclagem",
    longitude: -54.6402,
    latitude: -16.4658,
    address: "Av. Marechal Rondon, Vila Aurora",
    hours: "Seg a sex, 7h às 17h",
    phone: "(66) 3421-0000",
    wasteTypes: ["Papel", "Plástico", "Metal"],
  },
  {
    id: "ecoponto-jardim-italia",
    name: "Ecoponto Jardim Itália",
    kind: "Ecoponto municipal",
    longitude: -54.629,
    latitude: -16.4595,
    address: "Rua das Palmeiras, Jardim Itália",
    hours: "Todos os dias, 6h às 22h",
    phone: "(66) 3421-1111",
    wasteTypes: ["Orgânico", "Vidro", "Eletrônico"],
  },
  {
    id: "sucata-boa-vista",
    name: "Sucata Boa Vista",
    kind: "Ferro-velho",
    longitude: -54.648,
    latitude: -16.478,
    address: "Rua Goiás, Vila Operária",
    hours: "Seg a sáb, 8h às 18h",
    phone: "(66) 99911-2222",
    wasteTypes: ["Metal", "Sucata eletrônica"],
  },
  {
    id: "uniao-recicla",
    name: "Cooperativa União Recicla",
    kind: "Cooperativa de catadores",
    longitude: -54.622,
    latitude: -16.482,
    address: "Av. Amazonas, Setor 03",
    hours: "Seg a sex, 7h30 às 16h30",
    phone: "(66) 3421-3333",
    wasteTypes: ["Papelão", "Plástico"],
  },
  {
    id: "ponto-verde-centro",
    name: "Ponto Verde Centro",
    kind: "Ponto de coleta",
    longitude: -54.6355,
    latitude: -16.4655,
    address: "Rua Barão do Rio Branco, Centro",
    hours: "Ter, qui e sáb, 8h às 12h",
    phone: "(66) 99933-4444",
    wasteTypes: ["Óleo de cozinha", "Pilhas e baterias"],
  },
];

export type { HeroMapLocation };
export { HERO_MAP_LOCATIONS };
