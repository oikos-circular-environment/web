import type { ComponentType } from "react";

import { CompanyRegistrationScreen } from "./company-registration";
import { HomeScreen, HomeScreenAuthenticated } from "./home";
import { MarketListScreen } from "./pontos-de-coleta";
import { ProfileScreen } from "./profile";
import { ReportMapScreen } from "./report-map";

type ProductScreen = {
  id: string;
  title: string;
  caption: string;
  Component: ComponentType;
};

const screens: ProductScreen[] = [
  {
    id: "home",
    title: "Home",
    caption: "Tudo o que você precisa, num só lugar.",
    Component: HomeScreen,
  },
  {
    id: "home-authenticated",
    title: "Home (logado)",
    caption: "Mesmo componente, estado autenticado.",
    Component: HomeScreenAuthenticated,
  },
  {
    id: "report-map",
    title: "Denúncia — mapa",
    caption: "Mapa interativo, pontos ao redor de você.",
    Component: ReportMapScreen,
  },
  {
    id: "pontos-de-coleta",
    title: "Pontos de coleta",
    caption: "Empresas e coletores perto de você, com simulação de negociação.",
    Component: MarketListScreen,
  },
  {
    id: "profile",
    title: "Perfil",
    caption: "Endereço muda de acordo com a persona escolhida.",
    Component: ProfileScreen,
  },
  {
    id: "company-registration",
    title: "Cadastro de empresa",
    caption: "Crie e gerencie as empresas da persona, salvas no navegador.",
    Component: CompanyRegistrationScreen,
  },
];

export type { ProductScreen };
export { screens };
