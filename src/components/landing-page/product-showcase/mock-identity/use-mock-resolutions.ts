"use client";

import { useCallback, useEffect, useState } from "react";

type MockResolution = {
  id: string;
  complaintId: string;
  personaId: string;
  description: string;
  attachments: string[];
  createdAt: string;
};

const STORAGE_KEY = "oikos-preview-mock-resolutions";

function readResolutions(): MockResolution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Registrar resolução exige autenticação real — aqui vira registro local, só desta sessão de navegador. */
function useMockResolutions(complaintId: string) {
  const [all, setAll] = useState<MockResolution[]>([]);

  useEffect(() => {
    setAll(readResolutions());
  }, []);

  const addResolution = useCallback(
    (personaId: string, description: string, attachments: string[] = []) => {
      setAll((current) => {
        const next: MockResolution[] = [
          ...current,
          {
            id: crypto.randomUUID(),
            complaintId,
            personaId,
            description,
            attachments,
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [complaintId],
  );

  return {
    resolutions: all.filter((r) => r.complaintId === complaintId),
    addResolution,
  };
}

export type { MockResolution };
export { useMockResolutions };
