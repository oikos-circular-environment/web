"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PERSONAS, type Persona } from "./personas";
import {
  type PersonaOverride,
  usePersonaOverrides,
} from "./use-persona-overrides";

const STORAGE_KEY = "oikos-preview-persona";

type MockIdentityContextValue = {
  persona: Persona | null;
  personaId: string | null;
  setPersonaId: (id: string | null) => void;
  updatePersona: (patch: PersonaOverride) => void;
};

const MockIdentityContext = createContext<MockIdentityContextValue | null>(
  null,
);

function applyOverride(persona: Persona, override?: PersonaOverride): Persona {
  if (!override) return persona;
  return {
    ...persona,
    ...override,
    address: { ...persona.address, ...override.address },
  };
}

/**
 * Login simulado só para o device-preview: não autentica nada de verdade na
 * api, é só "quem o visitante está jogando de ser" nesta sessão de navegador.
 */
function MockIdentityProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<string | null>(null);
  const { overrides, setOverride } = usePersonaOverrides();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PERSONAS.some((p) => p.id === stored)) {
      setPersonaIdState(stored);
    }
  }, []);

  const setPersonaId = useCallback((id: string | null) => {
    setPersonaIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updatePersona = useCallback(
    (patch: PersonaOverride) => {
      if (!personaId) return;
      setOverride(personaId, patch);
    },
    [personaId, setOverride],
  );

  const basePersona = PERSONAS.find((p) => p.id === personaId) ?? null;
  const persona = basePersona
    ? applyOverride(basePersona, overrides[basePersona.id])
    : null;

  const value = useMemo(
    () => ({ persona, personaId, setPersonaId, updatePersona }),
    [persona, personaId, setPersonaId, updatePersona],
  );

  return (
    <MockIdentityContext.Provider value={value}>
      {children}
    </MockIdentityContext.Provider>
  );
}

function useMockIdentity() {
  const context = useContext(MockIdentityContext);
  if (!context) {
    throw new Error(
      "useMockIdentity deve ser usado dentro de <MockIdentityProvider>.",
    );
  }
  return context;
}

export { MockIdentityProvider, useMockIdentity };
