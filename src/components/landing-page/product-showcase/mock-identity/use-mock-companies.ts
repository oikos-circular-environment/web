"use client";

import { useCallback, useEffect, useState } from "react";

type MockCompany = {
  id: string;
  ownerPersonaId: string;
  identityType: "CPF" | "CNPJ";
  identity: string;
  companyType: "ONG" | "COMPANY" | "GOVERNMENT" | "COLLECTOR";
  corporateName: string;
  businessName: string;
  email: string | null;
  phones: string[];
  startedActivityIn: string | null;
  avatarDataUrl: string | null;
  status: true;
  createdAt: string;
};

const STORAGE_KEY = "oikos-preview-mock-companies";

function readCompanies(): MockCompany[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Cadastro de empresa de verdade exige autenticação — aqui vira registro
 * local (só desta sessão de navegador), filtrado pela persona na hora de
 * exibir, pra dar a impressão de que a empresa foi criada de verdade.
 */
function useMockCompanies() {
  const [companies, setCompanies] = useState<MockCompany[]>([]);

  useEffect(() => {
    setCompanies(readCompanies());
  }, []);

  const addCompany = useCallback(
    (input: Omit<MockCompany, "id" | "createdAt">) => {
      const company: MockCompany = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setCompanies((current) => {
        const next = [...current, company];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return company;
    },
    [],
  );

  return { companies, addCompany };
}

export type { MockCompany };
export { useMockCompanies };
