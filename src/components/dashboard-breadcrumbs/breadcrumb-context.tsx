"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type BreadcrumbMenuItem = {
  label: string;
  href: string;
};

type BreadcrumbOverride = {
  label?: string;
  items?: BreadcrumbMenuItem[];
};

type BreadcrumbOverrides = Record<string, BreadcrumbOverride>;

type BreadcrumbContextValue = {
  overrides: BreadcrumbOverrides;
  setOverride: (path: string, override: BreadcrumbOverride | undefined) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [overrides, setOverrides] = useState<BreadcrumbOverrides>({});

  const setOverride = useCallback(
    (path: string, override: BreadcrumbOverride | undefined) => {
      setOverrides((prev) => {
        if (!override) {
          if (!(path in prev)) return prev;
          const { [path]: _removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [path]: { ...prev[path], ...override } };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ overrides, setOverride }),
    [overrides, setOverride],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

function useBreadcrumbContext(): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error(
      "useBreadcrumbContext must be used within BreadcrumbProvider",
    );
  }
  return ctx;
}

export function useBreadcrumbOverrides(): BreadcrumbOverrides {
  return useBreadcrumbContext().overrides;
}

/**
 * Sobrescreve o label do crumb da rota atual com um dado dinâmico (ex: nome
 * de uma entidade buscada no cliente). Passe `undefined` enquanto o dado
 * ainda não carregou — o crumb cai pro fallback estático até lá.
 */
export function useBreadcrumbLabel(label: string | undefined) {
  const pathname = usePathname();
  const { setOverride } = useBreadcrumbContext();

  useEffect(() => {
    setOverride(pathname, label ? { label } : undefined);
    return () => setOverride(pathname, undefined);
  }, [pathname, label, setOverride]);
}

/**
 * Adiciona um dropdown de navegação a um crumb ancestral (ex: lista de
 * empresas no crumb "Empresas", pra trocar de empresa sem voltar à listagem).
 * `path` é o caminho exato desse crumb ancestral, não a rota atual.
 */
export function useBreadcrumbItems(
  path: string,
  items: BreadcrumbMenuItem[] | undefined,
) {
  const { setOverride } = useBreadcrumbContext();

  useEffect(() => {
    setOverride(path, items && items.length > 0 ? { items } : undefined);
    return () => setOverride(path, undefined);
  }, [path, items, setOverride]);
}
