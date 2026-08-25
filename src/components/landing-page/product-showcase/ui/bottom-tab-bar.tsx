"use client";

import { Home, ShieldAlert, ShoppingBag, User } from "lucide-react";

import { cn } from "@/libs/utils";

type TabId = "home" | "mercado" | "denuncia" | "perfil";

type TabItem = {
  id: TabId;
  icon: typeof Home;
  label: string;
};

const TABS: TabItem[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "mercado", icon: ShoppingBag, label: "Mercado" },
  { id: "denuncia", icon: ShieldAlert, label: "Denúncia" },
  { id: "perfil", icon: User, label: "Perfil" },
];

function BottomTabBar({ active }: { active: TabId }) {
  return (
    <div className="sticky bottom-0 flex items-center border-t border-border bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <div
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-1",
              isActive ? "text-primary" : "text-gray-400",
            )}
            data-demo-target={`tab-${tab.id}`}
            key={tab.id}
          >
            <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.8} />
            <span
              className={cn(
                "text-[10px]",
                isActive ? "font-semibold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { BottomTabBar };
