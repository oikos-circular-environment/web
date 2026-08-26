"use client";

import { useCallback, useEffect, useState } from "react";

type MarketSimulationItemType = "waste" | "service";

type MarketCheckoutItemDraft = {
  itemId: string;
  itemType: MarketSimulationItemType;
  itemName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

/** companyId -> itens do carrinho de simulação */
type SimulationsByCompany = Record<string, MarketCheckoutItemDraft[]>;

const STORAGE_KEY = "oikos-preview-market-simulations";

function readSimulations(): SimulationsByCompany {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * A simulação de negociação não tem backend — no mobile ela vive num Map em
 * memória que morre ao fechar o app; aqui persiste no localStorage do navegador.
 */
function useMarketSimulation(companyId: string) {
  const [simulations, setSimulations] = useState<SimulationsByCompany>({});

  useEffect(() => {
    setSimulations(readSimulations());
  }, []);

  const upsertItem = useCallback(
    (item: MarketCheckoutItemDraft) => {
      setSimulations((current) => {
        const items = current[companyId] ?? [];
        const existingIndex = items.findIndex(
          (candidate) =>
            candidate.itemId === item.itemId &&
            candidate.itemType === item.itemType,
        );

        const nextItems =
          existingIndex >= 0
            ? items.map((candidate, index) => {
                if (index !== existingIndex) return candidate;
                const quantity = candidate.quantity + item.quantity;
                return {
                  ...candidate,
                  quantity,
                  total: quantity * candidate.unitPrice,
                };
              })
            : [...items, item];

        const next = { ...current, [companyId]: nextItems };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [companyId],
  );

  const removeItem = useCallback(
    (itemId: string, itemType: MarketSimulationItemType) => {
      setSimulations((current) => {
        const next = {
          ...current,
          [companyId]: (current[companyId] ?? []).filter(
            (candidate) =>
              !(candidate.itemId === itemId && candidate.itemType === itemType),
          ),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [companyId],
  );

  return {
    items: simulations[companyId] ?? [],
    upsertItem,
    removeItem,
  };
}

export type { MarketCheckoutItemDraft, MarketSimulationItemType };
export { useMarketSimulation };
