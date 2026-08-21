import type { ComponentType } from "react";

import { HomeScreen, HomeScreenAuthenticated } from "./home";

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
];

export type { ProductScreen };
export { screens };
