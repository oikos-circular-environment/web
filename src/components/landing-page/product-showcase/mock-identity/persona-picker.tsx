"use client";

import Image from "next/image";

import { cn } from "@/libs/utils";

import { useMockIdentity } from "./mock-identity-context";
import { PERSONAS } from "./personas";

function PersonaPicker() {
  const { personaId, setPersonaId } = useMockIdentity();

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-2xl text-sm text-muted-foreground">
        As telas abaixo simulam um login. Escolha quem você quer ser pra navegar
        como essa pessoa. Nada disso autentica de verdade na api, é só pra dar a
        sensação real de uso.
      </p>

      <div className="flex flex-wrap gap-3">
        {PERSONAS.map((persona) => {
          const selected = personaId === persona.id;
          return (
            <button
              className={cn(
                "flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-white hover:bg-muted",
              )}
              key={persona.id}
              onClick={() => setPersonaId(selected ? null : persona.id)}
              type="button"
            >
              <div
                className={cn(
                  "relative size-10 shrink-0 overflow-hidden rounded-full ring-2",
                  selected ? "ring-primary" : "ring-transparent",
                )}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="40px"
                  src={persona.avatarSrc}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {persona.displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {persona.roleLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { PersonaPicker };
