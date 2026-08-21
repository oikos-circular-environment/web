"use client";

import { Info, Lock, Search, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

import { useMockIdentity } from "../mock-identity/mock-identity-context";

type FormState = {
  fullName: string;
  displayName: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  state: string;
  stateCode: string;
  city: string;
};

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={className}>
      <label
        className="mb-1 block text-xs font-medium text-gray-600"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </div>
  );
}

function ProfileScreen() {
  const { persona, updatePersona } = useMockIdentity();
  const [form, setForm] = useState<FormState | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!persona) {
      setForm(null);
      return;
    }
    setForm({
      fullName: persona.fullName,
      displayName: persona.displayName,
      phone: persona.phone,
      zipCode: persona.address.zipCode,
      street: persona.address.street,
      number: persona.address.number,
      complement: persona.address.complement ?? "",
      district: persona.address.district,
      state: persona.address.state,
      stateCode: persona.address.stateCode,
      city: persona.address.city,
    });
    setSavedAt(null);
  }, [persona]);

  if (!persona || !form) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white px-8 text-center">
        <Lock className="size-5 text-gray-400" strokeWidth={2} />
        <p className="text-sm text-gray-500">
          Escolha uma persona no topo da página pra ver o perfil.
        </p>
      </div>
    );
  }

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSavedAt(null);
  };

  const handleSave = () => {
    updatePersona({
      fullName: form.fullName,
      displayName: form.displayName,
      phone: form.phone,
      address: {
        zipCode: form.zipCode,
        street: form.street,
        number: form.number,
        complement: form.complement || null,
        district: form.district,
        state: form.state,
        stateCode: form.stateCode,
        city: form.city,
      },
    });
    setSavedAt(Date.now());
  };

  const handleCancel = () => {
    setForm({
      fullName: persona.fullName,
      displayName: persona.displayName,
      phone: persona.phone,
      zipCode: persona.address.zipCode,
      street: persona.address.street,
      number: persona.address.number,
      complement: persona.address.complement ?? "",
      district: persona.address.district,
      state: persona.address.state,
      stateCode: persona.address.stateCode,
      city: persona.address.city,
    });
    setSavedAt(null);
  };

  return (
    <div className="scrollbar-none flex h-full w-full flex-col overflow-y-auto bg-white">
      <div className="relative mb-14 h-24 shrink-0 bg-primary">
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <div className="relative size-16 overflow-hidden rounded-md shadow-lg ring-4 ring-white">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="64px"
              src={persona.avatarSrc}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8">
        <div className="flex items-start gap-2.5 rounded-md border border-sky-200 bg-sky-50 p-3">
          <Info className="size-4 shrink-0 text-sky-500" strokeWidth={2} />
          <p className="text-xs text-sky-900/80">
            O preenchimento das informações visa manter a plataforma segura. Sua
            interação não é pública.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Perfil</h2>
          <ProfileField
            label="Nome completo"
            onChange={setField("fullName")}
            value={form.fullName}
          />
          <ProfileField
            label="Como gostaria de ser chamado?"
            onChange={setField("displayName")}
            value={form.displayName}
          />
          <ProfileField
            label="Celular"
            onChange={setField("phone")}
            value={form.phone}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Endereço</h2>
            <p className="text-xs text-gray-500">
              É esse endereço que preenche a localização das suas denúncias.
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-medium text-gray-600"
              htmlFor="profile-zip-code"
            >
              CEP
            </label>
            <div className="flex items-center gap-2 rounded-md border border-border px-3">
              <input
                className="h-10 w-full text-sm outline-none"
                id="profile-zip-code"
                onChange={(event) => setField("zipCode")(event.target.value)}
                type="text"
                value={form.zipCode}
              />
              <Search
                className="size-4 shrink-0 text-gray-400"
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <ProfileField
              className="flex-1"
              label="Rua"
              onChange={setField("street")}
              value={form.street}
            />
            <ProfileField
              className="w-20"
              label="Número"
              onChange={setField("number")}
              value={form.number}
            />
          </div>

          <ProfileField
            label="Complemento"
            onChange={setField("complement")}
            value={form.complement}
          />

          <ProfileField
            label="Bairro"
            onChange={setField("district")}
            value={form.district}
          />

          <div className="flex gap-2">
            <ProfileField
              className="flex-1"
              label="Estado"
              onChange={setField("state")}
              value={form.state}
            />
            <ProfileField
              className="w-20"
              label="UF"
              onChange={setField("stateCode")}
              value={form.stateCode}
            />
          </div>

          <ProfileField
            label="Cidade"
            onChange={setField("city")}
            value={form.city}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            className="h-11 flex-1 cursor-pointer rounded-md border border-border bg-white text-sm font-semibold text-gray-700"
            onClick={handleCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="h-11 flex-1 cursor-pointer rounded-md bg-lime-800 text-sm font-semibold text-white"
            onClick={handleSave}
            type="button"
          >
            Confirmar
          </button>
        </div>

        {savedAt ? (
          <p className="flex items-center gap-1.5 text-xs text-lime-700">
            <User className="size-3" strokeWidth={2} />
            Perfil atualizado.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { ProfileScreen };
