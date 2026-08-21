type PersonaRole =
  | "CITIZEN"
  | "COLLECTOR"
  | "RECYCLING_COMPANY"
  | "GENERAL_COMPANY"
  | "GOVERNMENT";

type Persona = {
  id: string;
  role: PersonaRole;
  /** Mesmo rótulo usado em survey/packages/db/src/protocol/data.ts — não traduzir de novo. */
  roleLabel: string;
  roleDescription: string;
  fullName: string;
  displayName: string;
  avatarSrc: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
    stateCode: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
};

/**
 * 5 papéis do teste de usabilidade (survey/packages/db/src/protocol/data.ts),
 * cada um com um nome fictício — o survey só define o papel, não a pessoa.
 * Endereços espalhados perto do centro mock de Rondonópolis-MT (-16.471, -54.636),
 * mesma coordenada usada no filtro de Pontos de coleta e no mapa de Denúncia.
 */
const PERSONAS: Persona[] = [
  {
    id: "citizen",
    role: "CITIZEN",
    roleLabel: "Cidadã",
    roleDescription: "Denuncia descarte irregular e busca pontos de coleta.",
    fullName: "Camila Fernandes Rocha",
    displayName: "Camila Fernandes",
    avatarSrc: "/device-preview/personas/citizen.webp",
    phone: "(66) 9 9142-5578",
    address: {
      street: "Rua Barão do Rio Branco",
      number: "245",
      complement: null,
      district: "Centro",
      city: "Rondonópolis",
      state: "Mato Grosso",
      stateCode: "MT",
      zipCode: "78700-030",
      latitude: -16.4658,
      longitude: -54.6402,
    },
  },
  {
    id: "collector",
    role: "COLLECTOR",
    roleLabel: "Coletor",
    roleDescription: "Coleta materiais recicláveis por conta própria.",
    fullName: "Marcos Vinícius Lima",
    displayName: "Marcos Vinícius",
    avatarSrc: "/device-preview/personas/collector.webp",
    phone: "(66) 9 9871-2034",
    address: {
      street: "Rua Goiás",
      number: "812",
      complement: null,
      district: "Jardim Ipanema",
      city: "Rondonópolis",
      state: "Mato Grosso",
      stateCode: "MT",
      zipCode: "78735-150",
      latitude: -16.4801,
      longitude: -54.6501,
    },
  },
  {
    id: "recycling-company",
    role: "RECYCLING_COMPANY",
    roleLabel: "Empresa de reciclagem",
    roleDescription: "Coleta, tria, processa ou revende recicláveis.",
    fullName: "Fernanda Ribeiro Alves",
    displayName: "Fernanda Ribeiro",
    avatarSrc: "/device-preview/personas/recycling-company.webp",
    phone: "(66) 3411-7729",
    address: {
      street: "Av. Presidente Marques",
      number: "1500",
      complement: "Galpão 3",
      district: "Jardim Guanabara",
      city: "Rondonópolis",
      state: "Mato Grosso",
      stateCode: "MT",
      zipCode: "78710-100",
      latitude: -16.4775,
      longitude: -54.6291,
    },
  },
  {
    id: "general-company",
    role: "GENERAL_COMPANY",
    roleLabel: "Empresa comum",
    roleDescription: "Gera resíduos mas não trabalha com reciclagem.",
    fullName: "Rafael Andrade Costa",
    displayName: "Rafael Andrade",
    avatarSrc: "/device-preview/personas/general-company.webp",
    phone: "(66) 3421-8850",
    address: {
      street: "Rua Marechal Deodoro",
      number: "90",
      complement: "Loja 2",
      district: "Vila Aurora",
      city: "Rondonópolis",
      state: "Mato Grosso",
      stateCode: "MT",
      zipCode: "78740-220",
      latitude: -16.4622,
      longitude: -54.6455,
    },
  },
  {
    id: "government",
    role: "GOVERNMENT",
    roleLabel: "Órgão público",
    roleDescription: "Fiscaliza e encaminha denúncias ambientais.",
    fullName: "Juliana Martins Pereira",
    displayName: "Juliana Martins",
    avatarSrc: "/device-preview/personas/government.webp",
    phone: "(66) 3410-5600",
    address: {
      street: "Av. Marechal Rondon",
      number: "3200",
      complement: null,
      district: "Vila Operária",
      city: "Rondonópolis",
      state: "Mato Grosso",
      stateCode: "MT",
      zipCode: "78705-400",
      latitude: -16.4695,
      longitude: -54.6338,
    },
  },
];

export type { Persona, PersonaRole };
export { PERSONAS };
