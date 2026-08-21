import type { ComponentType } from "react";

import { HomeScreen, HomeScreenAuthenticated } from "./home";
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
    id: "profile",
    title: "Perfil",
    caption: "Endereço muda de acordo com a persona escolhida.",
    Component: ProfileScreen,
  },
];

export type { ProductScreen };
export { screens };
