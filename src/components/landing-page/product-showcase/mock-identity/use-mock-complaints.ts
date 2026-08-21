"use client";

import { useCallback, useEffect, useState } from "react";

type MockComplaint = {
  id: string;
  authorPersonaId: string;
  createdAt: string;
  observations: string | null;
  categoryIds: string[];
  lat: number;
  lon: number;
  address: string;
  photoDataUrl: string | null;
};

const STORAGE_KEY = "oikos-preview-mock-complaints";

function readComplaints(): MockComplaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Criar denúncia de verdade exige autenticação — aqui vira registro local
 * (só desta sessão de navegador), somado à listagem pública real na hora de
 * exibir, pra dar a impressão de que o registro aconteceu de verdade.
 */
function useMockComplaints() {
  const [complaints, setComplaints] = useState<MockComplaint[]>([]);

  useEffect(() => {
    setComplaints(readComplaints());
  }, []);

  const addComplaint = useCallback(
    (input: Omit<MockComplaint, "id" | "createdAt">) => {
      const complaint: MockComplaint = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setComplaints((current) => {
        const next = [...current, complaint];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return complaint;
    },
    [],
  );

  return { complaints, addComplaint };
}

export type { MockComplaint };
export { useMockComplaints };
