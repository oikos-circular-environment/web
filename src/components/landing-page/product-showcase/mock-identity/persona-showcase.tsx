"use client";

import { Check, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Map as MapcnMap, MapMarker, MarkerContent } from "@/components/ui/map";
import { cn } from "@/libs/utils";

import { useMockIdentity } from "./mock-identity-context";
import { PERSONAS, type Persona } from "./personas";

const GLOW_GRADIENT =
  "bg-[radial-gradient(circle,var(--primary)_0%,var(--color-landing-terracotta)_35%,transparent_70%)]";

function PersonaListItem({
  persona,
  active,
  selected,
  onHover,
  onSelect,
}: {
  persona: Persona;
  active: boolean;
  selected: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-left transition-colors",
        active
          ? "border-l-primary bg-primary/5"
          : "border-l-transparent hover:bg-muted",
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
      type="button"
    >
      <div
        className={cn(
          "relative size-9 shrink-0 overflow-hidden rounded-full ring-2",
          active ? "ring-primary" : "ring-transparent",
        )}
      >
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="36px"
          src={persona.avatarSrc}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">
          {persona.displayName}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {persona.roleLabel}
        </span>
      </div>
      {selected && (
        <Check
          aria-label="Selecionado"
          className="size-4 shrink-0 text-primary"
        />
      )}
    </button>
  );
}

function PersonaLocationMap({ persona }: { persona: Persona }) {
  return (
    <div className="h-28 w-full overflow-hidden rounded-lg border border-border sm:h-32">
      <MapcnMap
        attributionControl={false}
        center={[persona.address.longitude, persona.address.latitude]}
        interactive={false}
        key={persona.id}
        zoom={14}
      >
        <MapMarker
          latitude={persona.address.latitude}
          longitude={persona.address.longitude}
        >
          <MarkerContent>
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
              <MapPin
                className="size-3.5 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
          </MarkerContent>
        </MapMarker>
      </MapcnMap>
    </div>
  );
}

function PersonaDetailCard({
  persona,
  selected,
  onSelect,
}: {
  persona: Persona;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="relative h-full">
      <div
        aria-hidden
        className={cn(
          "animate-pulse-glow absolute -inset-3 rounded-[1.75rem] opacity-45 blur-xl",
          GLOW_GRADIENT,
        )}
      />
      <div className="relative h-full rounded-2xl bg-border p-px">
        <div
          aria-hidden
          className={cn(
            "animate-pulse-glow absolute inset-0 rounded-2xl",
            GLOW_GRADIENT,
          )}
        />
        <div className="relative flex h-full flex-col gap-6 rounded-[calc(var(--radius-2xl)-1px)] bg-card/70 p-6 backdrop-blur-md sm:p-8">
          <div className="flex items-start gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-4 ring-primary/15 sm:size-20">
              <Image
                alt={persona.displayName}
                className="object-cover"
                fill
                sizes="80px"
                src={persona.avatarSrc}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 pt-1">
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                {persona.roleLabel}
              </span>
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                {persona.fullName}
              </h3>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {persona.address.city}, {persona.address.stateCode}
              </span>
            </div>
          </div>

          <PersonaLocationMap persona={persona} />

          <p className="text-lg leading-snug font-medium text-foreground sm:text-xl">
            &ldquo;{persona.quote}&rdquo;
          </p>

          <p className="mt-auto text-sm text-muted-foreground">
            {persona.roleDescription}
          </p>

          <button
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              selected
                ? "bg-primary/10 text-primary"
                : "bg-primary text-primary-foreground hover:brightness-95",
            )}
            onClick={onSelect}
            type="button"
          >
            {selected && <Check className="size-4" />}
            {selected
              ? `Você é ${persona.displayName}`
              : `Entrar como ${persona.displayName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonaShowcase() {
  const { personaId, setPersonaId } = useMockIdentity();
  const [firstPersona] = PERSONAS;
  const [previewId, setPreviewId] = useState(firstPersona.id);

  useEffect(() => {
    if (personaId) setPreviewId(personaId);
  }, [personaId]);

  const activePersona =
    PERSONAS.find((persona) => persona.id === previewId) ?? firstPersona;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
      <div className="flex flex-col gap-1">
        {PERSONAS.map((persona) => (
          <PersonaListItem
            active={persona.id === previewId}
            key={persona.id}
            onHover={() => setPreviewId(persona.id)}
            onSelect={() => {
              setPreviewId(persona.id);
              setPersonaId(personaId === persona.id ? null : persona.id);
            }}
            persona={persona}
            selected={personaId === persona.id}
          />
        ))}
      </div>

      <PersonaDetailCard
        onSelect={() =>
          setPersonaId(personaId === activePersona.id ? null : activePersona.id)
        }
        persona={activePersona}
        selected={personaId === activePersona.id}
      />
    </div>
  );
}

export { PersonaShowcase };
