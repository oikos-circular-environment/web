"use client";

import { useCallback, useEffect, useState } from "react";

type VoteType = "RESOLVED" | "NOT_RESOLVED";
/** complaintId -> personaId -> voto */
type VotesByComplaint = Record<string, Record<string, VoteType>>;

const STORAGE_KEY = "oikos-preview-mock-votes";

function readVotes(): VotesByComplaint {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Votar exige autenticação real na api — aqui o voto vira estado local por
 * persona, somado (delta) em cima do `vote_counts` público já vindo da api,
 * pra parecer que o voto contou de verdade sem chamar o endpoint protegido.
 */
function useMockVotes(complaintId: string, personaId: string | null) {
  const [votes, setVotes] = useState<VotesByComplaint>({});

  useEffect(() => {
    setVotes(readVotes());
  }, []);

  const castVote = useCallback(
    (vote: VoteType) => {
      if (!personaId) return;
      setVotes((current) => {
        const next: VotesByComplaint = {
          ...current,
          [complaintId]: { ...current[complaintId], [personaId]: vote },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [complaintId, personaId],
  );

  const complaintVotes = votes[complaintId] ?? {};
  const currentVote = personaId ? (complaintVotes[personaId] ?? null) : null;
  const values = Object.values(complaintVotes);

  return {
    currentVote,
    castVote,
    resolvedDelta: values.filter((v) => v === "RESOLVED").length,
    notResolvedDelta: values.filter((v) => v === "NOT_RESOLVED").length,
  };
}

export type { VoteType };
export { useMockVotes };
