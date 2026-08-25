import type { ComponentType } from "react";

import { CompanyRegistrationScreen } from "./screens/company-registration";
import { HomeScreen } from "./screens/home";
import { MarketListScreen } from "./screens/pontos-de-coleta";
import { ProfileScreen } from "./screens/profile";
import { ReportMapScreen } from "./screens/report-map";

type ShowcaseTopic = { heading: string; body: string };
type ShowcaseStep = { number: number; title: string };
type ShowcaseCta = { label: string; href: string };

type ShowcaseBeat = {
  id: string;
  title: string;
  topics: ShowcaseTopic[];
  steps?: ShowcaseStep[];
  cta?: ShowcaseCta;
  Component: ComponentType;
  trackVh?: number;
};

const BEATS: ShowcaseBeat[] = [
  {
    id: "home",
    title: "A Home já sabe pra que você veio.",
    topics: [
      {
        heading: "Três caminhos, uma tela.",
        body: "Reciclagem, denúncia e cadastro de empresa ficam à vista assim que o app abre. Nada de menu escondido.",
      },
      {
        heading: "Explore antes de criar conta.",
        body: "Dá pra ver pontos de coleta e entender o app inteiro sem login. A conta entra quando você decidir usar.",
      },
      {
        heading: "Ela aprende quem é você.",
        body: "No segundo acesso, a Home já mostra seu endereço, seus atalhos e o que importa pra sua rotina.",
      },
    ],
    Component: HomeScreen,
    trackVh: 350,
  },
  {
    id: "profile",
    title: "Um cadastro, todo o resto se ajusta.",
    topics: [
      {
        heading: "Endereço vira ponto de partida.",
        body: "É dali que saem a origem das denúncias e o centro da busca por pontos de coleta.",
      },
      {
        heading: "Cada papel usa o app à sua maneira.",
        body: "Cidadã, coletor ou empresa: a experiência muda a partir do mesmo cadastro.",
      },
      {
        heading: "Edita na hora, direto no app.",
        body: "Nome, telefone, endereço: você atualiza quando quiser.",
      },
    ],
    Component: ProfileScreen,
    trackVh: 350,
  },
  {
    id: "company-registration",
    title: "Sua empresa entra no mapa de quem recicla.",
    topics: [
      {
        heading: "CNPJ preenche o resto.",
        body: "Razão social e endereço vêm automáticos assim que você digita o CNPJ.",
      },
      {
        heading: "Visibilidade imediata.",
        body: "Cadastrada, a empresa já aparece pra quem busca pontos de coleta na região.",
      },
      {
        heading: "O começo de uma negociação maior.",
        body: "Hoje você cadastra e gerencia. A negociação ponta a ponta é o próximo passo.",
      },
    ],
    Component: CompanyRegistrationScreen,
    trackVh: 400,
  },
  {
    id: "pontos-de-coleta",
    title: "O ponto de coleta certo, sem rodeio.",
    topics: [
      {
        heading: "Busca por raio, não por sorte.",
        body: "Parte do seu endereço ou da sua localização atual e ajusta o raio: do bairro à cidade toda.",
      },
      {
        heading: "Filtra pelo que você tem em mãos.",
        body: "Óleo, eletrônico, papelão: o mapa mostra só quem recebe aquele material.",
      },
      {
        heading: "Simula antes de sair de casa.",
        body: "Monta a carga, confere peso e valor estimado com a empresa antes de qualquer negociação real.",
      },
    ],
    Component: MarketListScreen,
    trackVh: 400,
  },
  {
    id: "report-map",
    title: "Da foto ao encaminhamento, em minutos.",
    topics: [
      {
        heading: "Cada pino é uma denúncia real.",
        body: "Categoria, gravidade e distância até você, direto no mapa.",
      },
      {
        heading: "A comunidade dá peso ao que você viu.",
        body: "Confirmação por foto, voto e comentário transformam uma observação isolada em pressão coletiva.",
      },
      {
        heading: "Acompanhamento até resolver.",
        body: "Quem fiscaliza recebe o histórico completo. Ninguém parte do zero.",
      },
    ],
    steps: [
      { number: 1, title: "Fotografe o local" },
      {
        number: 2,
        title: "Confirme a localização (geolocalização automática)",
      },
      { number: 3, title: "Acompanhe o status até a resolução" },
    ],
    cta: {
      label: "Denunciar agora",
      href: "#denunciar",
    },
    Component: ReportMapScreen,
    trackVh: 500,
  },
];

export type { ShowcaseBeat, ShowcaseTopic };
export { BEATS };
