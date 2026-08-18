import type { LucideIcon } from "lucide-react";
import { Building2, Megaphone, Recycle, ShieldCheck } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  moderatorOnly?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Serviços",
    items: [
      { title: "Pontos de coleta", url: "/dashboard/market", icon: Recycle },
      { title: "Denúncias", url: "/dashboard/denuncias", icon: Megaphone },
      { title: "Minhas empresas", url: "/dashboard/empresas", icon: Building2 },
    ],
  },
  {
    label: "Moderação",
    moderatorOnly: true,
    items: [
      { title: "Usuários", url: "/dashboard/moderacao", icon: ShieldCheck },
    ],
  },
];
