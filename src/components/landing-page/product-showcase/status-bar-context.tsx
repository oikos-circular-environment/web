"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type StatusBarVariant = "light" | "dark";

type StatusBarContextValue = {
  variant: StatusBarVariant;
  setVariant: (variant: StatusBarVariant) => void;
};

const DEFAULT_VARIANT: StatusBarVariant = "dark";

const StatusBarContext = createContext<StatusBarContextValue | null>(null);

function DeviceStatusBarProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<StatusBarVariant>(DEFAULT_VARIANT);

  return (
    <StatusBarContext.Provider value={{ variant, setVariant }}>
      {children}
    </StatusBarContext.Provider>
  );
}

function useDeviceStatusBarContext() {
  const context = useContext(StatusBarContext);
  if (!context) {
    throw new Error(
      "Componentes da status bar devem ser usados dentro de <DeviceStatusBarProvider>.",
    );
  }
  return context;
}

/**
 * Cada tela chama isso declarando o contraste que o topo do seu próprio
 * background pede (ex. "light" sobre uma foto escura) — mesma ideia do
 * `<StatusBar style="dark" />` do expo-status-bar, só que por tela em vez de
 * global, já que aqui as telas trocam dentro do mesmo device frame.
 */
function useSetStatusBarVariant(variant: StatusBarVariant) {
  const { setVariant } = useDeviceStatusBarContext();

  useEffect(() => {
    setVariant(variant);
    return () => setVariant(DEFAULT_VARIANT);
  }, [variant, setVariant]);
}

export type { StatusBarVariant };
export {
  DeviceStatusBarProvider,
  useDeviceStatusBarContext,
  useSetStatusBarVariant,
};
