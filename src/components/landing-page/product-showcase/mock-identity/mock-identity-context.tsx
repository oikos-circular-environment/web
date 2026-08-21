"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { PERSONAS, type Persona } from "./personas";

const STORAGE_KEY = "oikos-preview-persona";

type MockIdentityContextValue = {
  persona: Persona | null;
  personaId: string | null;
  setPersonaId: (id: string | null) => void;
};

const MockIdentityContext = createContext<MockIdentityContextValue | null>(
  null,
);

/**
 * Login simulado só para o device-preview: não autentica nada de verdade na
 * api, é só "quem o visitante está jogando de ser" nesta sessão de navegador.
 */
function MockIdentityProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<string | null>(null);

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

  const persona = PERSONAS.find((p) => p.id === personaId) ?? null;

  return (
    <MockIdentityContext.Provider value={{ persona, personaId, setPersonaId }}>
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
