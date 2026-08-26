"use client";

import { useCallback, useEffect, useState } from "react";

import type { Persona } from "./personas";

type PersonaOverride = Partial<
  Pick<Persona, "fullName" | "displayName" | "phone"> & {
    address: Partial<Persona["address"]>;
  }
>;

type OverridesByPersona = Record<string, PersonaOverride>;

const STORAGE_KEY = "oikos-preview-persona-overrides";

function readOverrides(): OverridesByPersona {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Edição de perfil não é persistida na api de verdade — fica em localStorage por persona. */
function usePersonaOverrides() {
  const [overrides, setOverrides] = useState<OverridesByPersona>({});

  useEffect(() => {
    setOverrides(readOverrides());
  }, []);

  const setOverride = useCallback(
    (personaId: string, patch: PersonaOverride) => {
      setOverrides((current) => {
        const next: OverridesByPersona = {
          ...current,
          [personaId]: {
            ...current[personaId],
            ...patch,
            address: {
              ...current[personaId]?.address,
              ...patch.address,
            },
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return { overrides, setOverride };
}

export type { PersonaOverride };
export { usePersonaOverrides };
