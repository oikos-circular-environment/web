import type { ComponentType } from "react";

import { HomeScreen } from "./home";

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
];

export type { ProductScreen };
export { screens };
