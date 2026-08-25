"use client";

import { format, parse, parseISO } from "date-fns";
import {
  AlertCircle,
  Building2,
  Camera,
  Check,
  Factory,
  Loader2,
  Lock,
  Plus,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/libs/utils";

import { compressImageFile } from "../mock-identity/compress-image-file";
import { useMockIdentity } from "../mock-identity/mock-identity-context";
import type { Persona } from "../mock-identity/personas";
import {
  type MockCompany,
  useMockCompanies,
} from "../mock-identity/use-mock-companies";
import { useSetStatusBarVariant } from "../status-bar-context";

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const PHONE_REGEX = /^\(\d{2}\)\s(\d\s)?\d{4}-\d{4}$/;
const DATE_BR_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

type IdentityType = "CPF" | "CNPJ";
type CompanyType = "ONG" | "COMPANY" | "GOVERNMENT" | "COLLECTOR";

const IDENTITY_TYPE_OPTIONS: { value: IdentityType; label: string }[] = [
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
];

const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: "ONG", label: "ONG" },
  { value: "COMPANY", label: "Empresa" },
  { value: "GOVERNMENT", label: "Governo" },
  { value: "COLLECTOR", label: "Coletor" },
];

type CompanyFormOutput = Omit<
  MockCompany,
  "id" | "ownerPersonaId" | "createdAt"
>;

type BrasilApiCnpjResponse = {
  razao_social: string | null;
  nome_fantasia: string | null;
  email: string | null;
  ddd_telefone_1: string | number | null;
  data_inicio_atividade: string | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhoneBr(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d{1,4})$/, "$1 $2-$3");
}

function maskDateBr(value: string) {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

/** Logo vem de foto comprimida em localStorage — cai pro logo institucional se a imagem não carregar. */
function CompanyLogo({ company }: { company: MockCompany }) {
  const [errored, setErrored] = useState(false);
  const name = company.businessName || company.corporateName;

  if (!company.avatarDataUrl) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Factory className="size-5 text-white" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
      <Image
        alt={name}
        className={errored ? "object-contain p-3 opacity-40" : "object-cover"}
        fill
        onError={() => setErrored(true)}
        sizes="64px"
        src={errored ? "/oikos-logo.png" : company.avatarDataUrl}
        unoptimized
      />
    </div>
  );
}

function CompanyCard({ company }: { company: MockCompany }) {
  const showSubtitle =
    Boolean(company.businessName) &&
    company.businessName !== company.corporateName;

  return (
    <div className="flex w-full flex-col gap-3 rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <CompanyLogo company={company} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-bold uppercase text-gray-900">
            {company.businessName || company.corporateName}
          </p>
          {showSubtitle ? (
            <p className="truncate text-xs text-muted-foreground">
              {company.corporateName}
            </p>
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {company.identity}
          </p>
          <span
            className={cn(
              "mt-1 w-fit shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              company.status
                ? "bg-lime-600/15 text-lime-700"
                : "bg-red-600/15 text-red-600",
            )}
          >
            {company.status ? "Ativa" : "Inativa"}
          </span>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  action,
  dataDemoTarget,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  action?: ReactNode;
  dataDemoTarget?: string;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1" data-demo-target={dataDemoTarget}>
      <label className="text-xs font-medium text-gray-600" htmlFor={id}>
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-border focus-within:border-primary",
          action ? "pr-1.5" : "px-3",
        )}
      >
        <input
          className="h-10 w-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          id={id}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        {action}
      </div>
    </div>
  );
}

function CreateCompanySheet({
  open,
  persona,
  onSubmit,
  onClose,
}: {
  open: boolean;
  persona: Persona;
  onSubmit: (input: CompanyFormOutput) => void;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useProfileData, setUseProfileData] = useState(false);
  const [identityType, setIdentityType] = useState<IdentityType>("CNPJ");
  const [identity, setIdentity] = useState("");
  const [companyType, setCompanyType] = useState<CompanyType>("COMPANY");
  const [corporateName, setCorporateName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [startedActivityIn, setStartedActivityIn] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setUseProfileData(false);
    setIdentityType("CNPJ");
    setIdentity("");
    setCompanyType("COMPANY");
    setCorporateName("");
    setBusinessName("");
    setEmail("");
    setPrimaryPhone("");
    setSecondaryPhone("");
    setStartedActivityIn("");
    setAvatarDataUrl(null);
    setError(null);
    setCnpjError(null);
  }, [open]);

  useEffect(() => {
    if (!useProfileData) return;
    setIdentityType("CPF");
    setCompanyType("COLLECTOR");
    setCorporateName(persona.fullName);
    setBusinessName(persona.displayName);
    setPrimaryPhone(maskPhoneBr(persona.phone));
  }, [useProfileData, persona]);

  const handleIdentityTypeChange = (next: IdentityType) => {
    setIdentityType(next);
    if (next === "CPF") {
      setCompanyType("COLLECTOR");
    } else if (companyType === "COLLECTOR") {
      setCompanyType("COMPANY");
    }
  };

  const handleChangeCorporateName = (value: string) => {
    setCorporateName(value);
    if (identityType === "CPF") {
      setBusinessName(value);
    }
  };

  const handleSearchCnpj = async () => {
    const digits = onlyDigits(identity);
    if (digits.length !== 14) {
      setCnpjError("O CNPJ deve conter 14 dígitos.");
      return;
    }

    setIsSearchingCnpj(true);
    setCnpjError(null);
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${digits}`,
      );
      if (!response.ok) throw new Error("CNPJ não encontrado.");

      const data = (await response.json()) as BrasilApiCnpjResponse;
      if (data.razao_social) setCorporateName(data.razao_social);
      if (data.nome_fantasia) setBusinessName(data.nome_fantasia);
      if (data.email) setEmail(data.email);
      if (data.ddd_telefone_1) {
        setPrimaryPhone(maskPhoneBr(String(data.ddd_telefone_1)));
      }
      if (data.data_inicio_atividade) {
        const parsedDate = parseISO(data.data_inicio_atividade);
        if (!Number.isNaN(parsedDate.getTime())) {
          setStartedActivityIn(format(parsedDate, "dd/MM/yyyy"));
        }
      }
    } catch {
      setCnpjError("CNPJ não encontrado.");
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsCompressing(true);
    try {
      const dataUrl = await compressImageFile(file);
      setAvatarDataUrl(dataUrl);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = () => {
    if (identityType === "CNPJ" && !CNPJ_REGEX.test(identity)) {
      setError("CNPJ deve estar no formato: 00.000.000/0000-00");
      return;
    }
    if (identityType === "CPF" && !CPF_REGEX.test(identity)) {
      setError("CPF deve estar no formato: 000.000.000-00");
      return;
    }
    if (!corporateName.trim()) {
      setError(
        identityType === "CNPJ"
          ? "Razão social é obrigatória."
          : "Nome completo é obrigatório.",
      );
      return;
    }
    if (!PHONE_REGEX.test(primaryPhone)) {
      setError("Telefone principal inválido.");
      return;
    }
    if (secondaryPhone && !PHONE_REGEX.test(secondaryPhone)) {
      setError("Telefone secundário inválido.");
      return;
    }

    let normalizedStartedActivityIn: string | null = null;
    if (startedActivityIn) {
      const parsedDate = DATE_BR_REGEX.test(startedActivityIn)
        ? parse(startedActivityIn, "dd/MM/yyyy", new Date())
        : null;
      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        setError("Data de início inválida. Use o formato DD/MM/AAAA.");
        return;
      }
      if (parsedDate > new Date()) {
        setError("A data de início não pode ser no futuro.");
        return;
      }
      normalizedStartedActivityIn = format(parsedDate, "yyyy-MM-dd");
    }

    setError(null);
    onSubmit({
      identityType,
      identity,
      companyType,
      corporateName: corporateName.trim(),
      businessName: businessName.trim(),
      email: email.trim() || null,
      phones: [primaryPhone, secondaryPhone].filter((phone) => phone !== ""),
      startedActivityIn: normalizedStartedActivityIn,
      avatarDataUrl,
      status: true,
    });
  };

  const availableCompanyTypes =
    identityType === "CPF"
      ? COMPANY_TYPE_OPTIONS.filter((option) => option.value === "COLLECTOR")
      : COMPANY_TYPE_OPTIONS.filter((option) => option.value !== "COLLECTOR");

  return (
    <>
      <button
        aria-label="Fechar nova empresa"
        className={cn(
          "absolute inset-0 z-30 cursor-default bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-40 flex h-[90%] flex-col rounded-t-md bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <button
          aria-label="Fechar nova empresa"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        <div className="flex shrink-0 items-center px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Nova empresa
          </h2>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-4 pb-4">
          <input
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          <div className="flex items-center gap-3">
            {avatarDataUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={avatarDataUrl}
                />
                <button
                  aria-label="Remover logo"
                  className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60"
                  onClick={() => setAvatarDataUrl(null)}
                  type="button"
                >
                  <X className="size-3 text-white" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                aria-label="Escolher logo"
                className="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-gray-400 disabled:cursor-not-allowed"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Factory className="size-6" strokeWidth={1.5} />
              </button>
            )}
            <button
              className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Camera className="size-4" strokeWidth={2} />
              {isCompressing
                ? "Processando..."
                : avatarDataUrl
                  ? "Trocar logo"
                  : "Escolher logo"}
            </button>
          </div>

          <button
            className="mt-4 flex w-full cursor-pointer items-start gap-2.5 rounded-md border border-border bg-white p-3 text-left"
            onClick={() => setUseProfileData((current) => !current)}
            type="button"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                useProfileData
                  ? "border-lime-800 bg-lime-800"
                  : "border-gray-300 bg-white",
              )}
            >
              {useProfileData ? (
                <Check className="size-3 text-white" strokeWidth={3} />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-900">
                Utilizar os dados do meu perfil
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-gray-500">
                O seu CPF não será exposto publicamente. Garantimos a
                privacidade dos seus dados pessoais.
              </span>
            </span>
          </button>

          <div className="mt-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-gray-600">
              Tipo de identidade
            </p>
            <div className="flex gap-2">
              {IDENTITY_TYPE_OPTIONS.map((option) => (
                <button
                  className={cn(
                    "flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold",
                    identityType === option.value
                      ? "bg-lime-800 text-white"
                      : "border border-border bg-white text-gray-600",
                  )}
                  key={option.value}
                  onClick={() => handleIdentityTypeChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <FormField
              action={
                identityType === "CNPJ" ? (
                  <button
                    aria-label="Buscar dados do CNPJ"
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-lime-800 text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    disabled={isSearchingCnpj}
                    onClick={() => void handleSearchCnpj()}
                    type="button"
                  >
                    {isSearchingCnpj ? (
                      <Loader2
                        className="size-3.5 animate-spin"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Search className="size-3.5" strokeWidth={2.5} />
                    )}
                  </button>
                ) : undefined
              }
              label="Identidade"
              onChange={(value) =>
                setIdentity(
                  identityType === "CNPJ" ? maskCnpj(value) : maskCpf(value),
                )
              }
              placeholder={
                identityType === "CNPJ"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"
              }
              value={identity}
            />
            {cnpjError ? (
              <p className="text-xs text-red-600">{cnpjError}</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <p className="text-xs font-medium text-gray-600">Tipo de empresa</p>
            <div className="flex flex-wrap gap-2">
              {availableCompanyTypes.map((option) => (
                <button
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold",
                    companyType === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-muted-foreground",
                    identityType === "CPF" &&
                      "disabled:cursor-not-allowed disabled:opacity-70",
                  )}
                  disabled={identityType === "CPF"}
                  key={option.value}
                  onClick={() => setCompanyType(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {identityType === "CPF" ? (
              <p className="text-[11px] text-gray-500">
                Pessoa física só pode ser cadastrada como Coletor.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <FormField
              label={identityType === "CNPJ" ? "Razão social" : "Nome completo"}
              onChange={handleChangeCorporateName}
              placeholder={
                identityType === "CNPJ"
                  ? "Nome completo da empresa"
                  : "Seu nome completo"
              }
              value={corporateName}
            />

            <FormField
              data-demo-target="company-name"
              label={
                identityType === "CNPJ"
                  ? "Nome fantasia"
                  : "Como quer ser chamado"
              }
              onChange={setBusinessName}
              placeholder="Nome fantasia (opcional)"
              value={businessName}
            />

            <FormField
              inputMode="email"
              label="E-mail"
              onChange={setEmail}
              placeholder="contato@empresa.com"
              value={email}
            />

            <FormField
              inputMode="tel"
              label="Telefone principal"
              onChange={(value) => setPrimaryPhone(maskPhoneBr(value))}
              placeholder="(00) 00000-0000"
              value={primaryPhone}
            />

            <FormField
              inputMode="tel"
              label="Telefone secundário"
              onChange={(value) => setSecondaryPhone(maskPhoneBr(value))}
              placeholder="(00) 00000-0000 (opcional)"
              value={secondaryPhone}
            />

            <FormField
              inputMode="numeric"
              label="Data de início da atividade"
              onChange={(value) => setStartedActivityIn(maskDateBr(value))}
              placeholder="DD/MM/AAAA"
              value={startedActivityIn}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4">
          {error ? (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="size-3 shrink-0" strokeWidth={2} />
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <button
              className="h-11 flex-1 cursor-pointer rounded-md border border-border bg-white text-sm font-semibold text-gray-700"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-11 flex-1 cursor-pointer rounded-md bg-lime-800 text-sm font-semibold text-white"
              data-demo-target="company-submit"
              onClick={handleSubmit}
              type="button"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CompanyRegistrationContent({ persona }: { persona: Persona }) {
  const { companies, addCompany } = useMockCompanies();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const myCompanies = companies.filter(
    (company) => company.ownerPersonaId === persona.id,
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <div className="scrollbar-none h-full overflow-y-auto px-4 pb-8 pt-12">
        <div className="flex items-center gap-4 rounded-md bg-gray-100 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-semibold text-gray-900">
              Empresas
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie suas empresas cadastradas na plataforma.
            </p>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-lime-800">
            <Factory className="size-6 text-white" strokeWidth={2.25} />
          </div>
        </div>

        <button
          className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-lime-800 text-sm font-semibold text-white"
          data-demo-target="company-new-btn"
          onClick={() => setIsCreateSheetOpen(true)}
          type="button"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Nova empresa
        </button>

        <div className="mt-6 mb-3 flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold text-gray-900">
            Minhas empresas
          </h3>
          <p className="text-xs text-muted-foreground">
            Listagem das empresas ligadas à sua conta, ativas ou não.
          </p>
        </div>

        {myCompanies.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-white p-6">
            <Building2 className="size-8 text-gray-400" strokeWidth={1.5} />
            <p className="text-center text-sm text-gray-500">
              Nenhuma empresa cadastrada.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myCompanies.map((company) => (
              <CompanyCard company={company} key={company.id} />
            ))}
          </div>
        )}
      </div>

      <CreateCompanySheet
        onClose={() => setIsCreateSheetOpen(false)}
        onSubmit={(input) => {
          addCompany({ ...input, ownerPersonaId: persona.id });
          setIsCreateSheetOpen(false);
        }}
        open={isCreateSheetOpen}
        persona={persona}
      />
    </div>
  );
}

function CompanyRegistrationScreen() {
  useSetStatusBarVariant("dark");
  const { persona } = useMockIdentity();

  if (!persona) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white px-8 text-center">
        <Lock className="size-5 text-gray-400" strokeWidth={2} />
        <p className="text-sm text-gray-500">
          Escolha uma persona no topo da página pra gerenciar suas empresas.
        </p>
      </div>
    );
  }

  return <CompanyRegistrationContent persona={persona} />;
}

export { CompanyRegistrationScreen };
