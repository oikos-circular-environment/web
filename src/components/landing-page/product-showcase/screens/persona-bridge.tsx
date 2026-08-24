"use client";

import { useEffect } from "react";

import { useMockIdentity } from "../mock-identity/mock-identity-context";
import { PersonaPicker } from "../mock-identity/persona-picker";
import { PERSONAS } from "../mock-identity/personas";

function PersonaBridgeScreen() {
  const { personaId, setPersonaId } = useMockIdentity();

  useEffect(() => {
    if (!personaId) setPersonaId(PERSONAS[0].id);
  }, [personaId, setPersonaId]);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 bg-white px-6">
      <p className="text-sm text-muted-foreground">Continue como:</p>
      <PersonaPicker />
    </div>
  );
}

export { PersonaBridgeScreen };
