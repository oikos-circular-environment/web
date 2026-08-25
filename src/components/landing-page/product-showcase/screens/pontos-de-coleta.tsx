"use client";

import {
  addDays,
  format,
  getDay,
  isBefore,
  isWithinInterval,
  parse,
} from "date-fns";
import {
  Calculator,
  Check,
  CornerUpRight,
  Hammer,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Recycle,
  Search,
  Sprout,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/libs/utils";

import {
  type MarketCategory,
  type MarketCompany,
  useMarket,
} from "../hooks/use-market";
import {
  type MarketCheckoutItemDraft,
  type MarketSimulationItemType,
  useMarketSimulation,
} from "../mock-identity/use-market-simulation";
import {
  type MockCompany,
  useMockCompanies,
} from "../mock-identity/use-mock-companies";
import { useSetStatusBarVariant } from "../status-bar-context";

/** Rondonópolis, MT — mesma coordenada usada no filtro de Pontos de coleta e no mapa de Denúncia. */
const CENTER: [number, number] = [-54.636, -16.471];

type CompanyBusinessHour = MarketCompany["business_hours"][number];
type CompanyTimeSlot = CompanyBusinessHour["time_slots"][number];
type CompanyDayOfWeek = CompanyBusinessHour["day_of_week"];
type CompanyCatalogItem = MarketCompany["services"][number];

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "15 km", value: 15000 },
  { label: "20 km", value: 20000 },
  { label: "30 km", value: 30000 },
  { label: "40 km", value: 40000 },
];

const MEASUREMENT_SYMBOL: Record<string, string> = {
  KG: "kg",
  L: "L",
  UNIT: "un",
  M: "m",
  M2: "m²",
  M3: "m³",
  ML: "ml",
  DAY: "diária",
};

const DAY_LABELS: Record<CompanyDayOfWeek, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

const DAY_OF_WEEK_BY_INDEX = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const satisfies readonly CompanyDayOfWeek[];

function mockCompanyToMarketCompany(mock: MockCompany): MarketCompany {
  const now = new Date();
  const weekday = DAY_OF_WEEK_BY_INDEX[now.getDay()];
  return {
    id: mock.id,
    business_name: mock.businessName || mock.corporateName,
    corporate_name: mock.corporateName,
    company_type: mock.companyType,
    status: mock.status,
    phones: mock.phones,
    address: {
      id: `${mock.id}-addr`,
      zip_code: "78700-000",
      street: "Rua Demo",
      number: "123",
      complement: null,
      district: "Centro",
      city: "Rondonópolis",
      state: "Mato Grosso",
      state_code: "MT",
      latitude: CENTER[1],
      longitude: CENTER[0],
    },
    avatar: mock.avatarDataUrl,
    services: [],
    wastes: [
      {
        id: `${mock.id}-waste-oleo`,
        name: "Óleo de cozinha",
        price: 2.5,
        unit: "L",
        waste_category_id: "demo-waste",
        quantity: 0,
        description: "Óleo de cozinha usado para reciclagem",
        waste_category: {
          id: "demo-waste",
          name: "Óleo",
          hazard_levels: ["LOW"],
        },
      },
    ],
    business_hours: [
      {
        id: `${mock.id}-bh`,
        day_of_week: weekday,
        is_open: true,
        time_slots: [
          { id: `${mock.id}-slot`, start_time: "09:00", end_time: "18:00" },
        ],
      },
    ],
    distance_in_meters: 0,
    identity: mock.identity,
    identity_type: "CNPJ",
  };
}

function formatDistanceLabel(meters: number) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatQuantityLabel(value: number) {
  return String(value).replace(".", ",");
}

function maskCnpj(identity: string) {
  return identity
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function getCompanySubtitle(company: MarketCompany) {
  return company.identity_type === "CNPJ" && company.identity
    ? maskCnpj(company.identity)
    : "Coletor independente";
}

function getInitials(businessName: string) {
  return businessName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getCatalogItems(
  company: MarketCompany,
  itemType: MarketSimulationItemType,
) {
  return itemType === "waste" ? company.wastes : company.services;
}

function parseQuantity(rawValue: string) {
  const value = Number(rawValue.replace(",", ".").trim());
  if (Number.isNaN(value) || value < 0) return 0;
  return value;
}

/** Slot que termina depois da meia-noite vira intervalo no dia seguinte. */
function isTimeInsideSlot(currentDate: Date, slot: CompanyTimeSlot) {
  const slotStart = parse(slot.start_time, "HH:mm", currentDate);
  const parsedSlotEnd = parse(slot.end_time, "HH:mm", currentDate);

  if (
    Number.isNaN(slotStart.getTime()) ||
    Number.isNaN(parsedSlotEnd.getTime())
  ) {
    return false;
  }

  const slotEnd = isBefore(parsedSlotEnd, slotStart)
    ? addDays(parsedSlotEnd, 1)
    : parsedSlotEnd;

  return isWithinInterval(currentDate, { start: slotStart, end: slotEnd });
}

function getCurrentBusinessHour(
  businessHours: CompanyBusinessHour[],
  currentDate: Date,
): CompanyBusinessHour | null {
  const currentDayOfWeek = DAY_OF_WEEK_BY_INDEX[getDay(currentDate)];
  return (
    businessHours.find((hour) => hour.day_of_week === currentDayOfWeek) ?? null
  );
}

function isCompanyOpenNow(
  businessHours: CompanyBusinessHour[],
  currentDate: Date,
) {
  const todayHours = getCurrentBusinessHour(businessHours, currentDate);

  return Boolean(
    todayHours?.is_open &&
      todayHours.time_slots.some((slot) => isTimeInsideSlot(currentDate, slot)),
  );
}

type AppliedFilters = {
  query: string | null;
  category: MarketCategory;
  radius: number;
};

const DEFAULT_FILTERS: AppliedFilters = {
  query: null,
  category: null,
  radius: 10000,
};

function FilterChip({
  selected,
  onClick,
  icon: Icon,
  label,
  dataDemoTarget,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: typeof Recycle | null;
  label: string;
  dataDemoTarget?: string;
}) {
  return (
    <button
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-muted-foreground",
      )}
      data-demo-target={dataDemoTarget}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="size-3.5" strokeWidth={2.5} /> : null}
      {label}
    </button>
  );
}

function CompanyLogo({ company }: { company: MarketCompany }) {
  const [errored, setErrored] = useState(false);

  if (!company.avatar) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary">
        {company.company_type === "COLLECTOR" ? (
          <Sprout className="size-5 text-white" strokeWidth={2} />
        ) : (
          <span className="text-sm font-bold text-primary-foreground">
            {getInitials(company.business_name)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
      <Image
        alt={company.business_name}
        className={errored ? "object-contain p-3 opacity-40" : "object-cover"}
        fill
        onError={() => setErrored(true)}
        sizes="64px"
        src={errored ? "/oikos-logo.png" : company.avatar}
        unoptimized
      />
    </div>
  );
}

function CompanyBadges({
  company,
  now,
}: {
  company: MarketCompany;
  now: Date;
}) {
  const isOpen = isCompanyOpenNow(company.business_hours, now);

  return (
    <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pt-1">
      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {formatDistanceLabel(company.distance_in_meters)}
      </span>
      {company.company_type === "COLLECTOR" ? (
        <span className="shrink-0 rounded-md bg-lime-800 px-2 py-0.5 text-[11px] font-semibold text-white">
          Coletor
        </span>
      ) : null}
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
          isOpen
            ? "bg-lime-600/15 text-lime-700"
            : "bg-red-600/15 text-red-600",
        )}
      >
        {isOpen ? "Aberto" : "Fechado"}
      </span>
    </div>
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 animate-pulse rounded-lg bg-gray-100" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-14 animate-pulse rounded-full bg-gray-100" />
            <div className="h-4 w-12 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  now,
  category,
  onSelect,
  index,
}: {
  company: MarketCompany;
  now: Date;
  category: MarketCategory;
  onSelect: () => void;
  index: number;
}) {
  const showWastes = !category || category === "waste";
  const showServices = !category || category === "services";

  return (
    <button
      className="flex w-full cursor-pointer flex-col gap-3 rounded-md border border-border bg-white p-4 text-left transition-colors hover:bg-gray-50"
      data-demo-target={index === 0 ? "company-card-0" : undefined}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo company={company} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-bold uppercase text-gray-900">
            {company.business_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {getCompanySubtitle(company)}
          </p>
          <CompanyBadges company={company} now={now} />
        </div>
      </div>

      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
        {showWastes
          ? company.wastes.map((waste) => (
              <span
                className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                key={`waste-${waste.id}`}
              >
                <Recycle className="size-2.5" strokeWidth={2.5} />
                {waste.name}
              </span>
            ))
          : null}
        {showServices
          ? company.services.map((service) => (
              <span
                className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                key={`service-${service.id}`}
              >
                <Hammer className="size-2.5" strokeWidth={2.5} />
                {service.name}
              </span>
            ))
          : null}
      </div>
    </button>
  );
}

function RadiusSheet({
  open,
  radius,
  onSelect,
  onClose,
}: {
  open: boolean;
  radius: number;
  onSelect: (radius: number) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        aria-label="Fechar raio de busca"
        className={cn(
          "absolute inset-0 z-30 cursor-default bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-md bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <button
          aria-label="Fechar raio de busca"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        <div className="flex shrink-0 items-center px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Raio de busca
          </h2>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-6">
          {RADIUS_OPTIONS.map((option) => (
            <button
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md p-3 text-sm font-medium",
                option.value === radius
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-white text-gray-700",
              )}
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              type="button"
            >
              {option.label}
              {option.value === radius ? (
                <Check className="size-4" strokeWidth={2.5} />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function BusinessHoursSheet({
  open,
  businessHours,
  onClose,
}: {
  open: boolean;
  businessHours: CompanyBusinessHour[];
  onClose: () => void;
}) {
  return (
    <>
      <button
        aria-label="Fechar horários de funcionamento"
        className={cn(
          "absolute inset-0 z-50 cursor-default bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-[60] flex h-[60%] flex-col rounded-t-md bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <button
          aria-label="Fechar horários de funcionamento"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        <div className="flex shrink-0 flex-col gap-1 px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Horários de funcionamento
          </h2>
          <p className="text-xs text-muted-foreground">
            Confira os horários de funcionamento para planejar sua visita.
          </p>
        </div>

        <div className="scrollbar-none flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-6">
          {DAY_OF_WEEK_BY_INDEX.map((day) => {
            const hour = businessHours.find(
              (candidate) => candidate.day_of_week === day,
            );

            return (
              <div
                className="flex items-center justify-between rounded-md border border-border p-3"
                key={day}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {DAY_LABELS[day]}
                </p>
                {!hour?.is_open || hour.time_slots.length === 0 ? (
                  <span className="rounded-md bg-red-600/15 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    Fechado
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    {hour.time_slots.map((slot) => (
                      <span className="text-xs text-gray-700" key={slot.id}>
                        {slot.start_time} - {slot.end_time}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function CatalogItemCard({
  icon: Icon,
  item,
  onSelect,
  index,
}: {
  icon: typeof Recycle;
  item: CompanyCatalogItem;
  onSelect: () => void;
  index: number;
}) {
  return (
    <button
      className="flex w-full cursor-pointer flex-col gap-2 rounded-md border border-border bg-white p-3 text-left transition-colors hover:bg-gray-50"
      data-demo-target={index === 0 ? "catalog-item-0" : undefined}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-gray-900" strokeWidth={2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-bold text-gray-900">
            {item.name}
          </p>
          <div className="flex items-end gap-0.5">
            <span className="text-sm font-bold text-muted-foreground">
              {formatCurrency(item.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              /{MEASUREMENT_SYMBOL[item.unit] ?? item.unit}
            </span>
          </div>
        </div>
      </div>
      {item.description ? (
        <p className="text-sm text-gray-600">{item.description}</p>
      ) : null}
      <span className="w-fit rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
        {item.waste_category.name}
      </span>
    </button>
  );
}

function PhoneRow({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-white p-3">
      <p className="min-w-0 flex-1 truncate text-sm text-gray-900">{phone}</p>
      <a
        aria-label={`Ligar para ${phone}`}
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
        href={`tel:${phone}`}
      >
        <Phone className="size-3.5 text-gray-900" strokeWidth={2} />
      </a>
      <a
        aria-label={`Conversar no WhatsApp com ${phone}`}
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
        href={`https://wa.me/55${digits}`}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircle className="size-3.5 text-gray-900" strokeWidth={2} />
      </a>
    </div>
  );
}

function CompanyGeneralTab({
  company,
  now,
  onOpenBusinessHours,
  onSelectItem,
}: {
  company: MarketCompany;
  now: Date;
  onOpenBusinessHours: () => void;
  onSelectItem: (itemType: MarketSimulationItemType, itemId: string) => void;
}) {
  const address = company.address;
  const isOpen = isCompanyOpenNow(company.business_hours, now);
  const currentBusinessHour = getCurrentBusinessHour(
    company.business_hours,
    now,
  );
  const todayLabel = DAY_LABELS[DAY_OF_WEEK_BY_INDEX[getDay(now)]];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address.street}, ${address.number}, ${address.city}`,
  )}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-950">Informações</h3>

        <a
          className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white p-3 transition-colors hover:bg-gray-50"
          href={mapsUrl}
          rel="noreferrer"
          target="_blank"
        >
          <p className="min-w-0 flex-1 text-sm text-gray-900">
            {address.street}, {address.number} - {address.district},{" "}
            {address.city} - {address.state_code}, {address.zip_code}
          </p>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
            <CornerUpRight className="size-3.5 text-gray-900" strokeWidth={2} />
          </span>
        </a>

        {company.phones.map((phone) => (
          <PhoneRow key={phone} phone={phone} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-950">
          Horário de funcionamento
        </h3>
        <p className="text-xs text-muted-foreground">
          O horário de funcionamento pode variar, clique sobre o horário para
          mais detalhes.
        </p>

        <button
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-white p-3 text-left transition-colors hover:bg-gray-50"
          onClick={onOpenBusinessHours}
          type="button"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">{todayLabel}</p>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                  isOpen
                    ? "bg-lime-600/15 text-lime-700"
                    : "bg-red-600/15 text-red-600",
                )}
              >
                {isOpen ? "Aberto" : "Fechado"}
              </span>
            </div>
            <p className="pt-0.5 text-xs text-gray-500">
              Agora são {format(now, "HH:mm")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            {currentBusinessHour?.time_slots.length ? (
              currentBusinessHour.time_slots.map((slot) => (
                <span className="text-xs font-bold text-gray-700" key={slot.id}>
                  {slot.start_time} - {slot.end_time}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-gray-700">Fechado</span>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-amber-100 p-3">
        <TriangleAlert
          className="size-4 shrink-0 text-gray-500"
          strokeWidth={2}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Atenção</p>
          <p className="text-xs text-gray-700">
            Sempre faça separação e higienização do item, a qualidade impacta no
            valor do resíduo!
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-950">Produtos</h3>
        {company.wastes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {company.wastes.map((waste, index) => (
              <CatalogItemCard
                icon={Recycle}
                index={index}
                item={waste}
                key={waste.id}
                onSelect={() => onSelectItem("waste", waste.id)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
            Nenhum produto cadastrado para esta empresa.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-950">Serviços</h3>
        {company.services.length > 0 ? (
          <div className="flex flex-col gap-2">
            {company.services.map((service, index) => (
              <CatalogItemCard
                icon={Hammer}
                index={index}
                item={service}
                key={service.id}
                onSelect={() => onSelectItem("service", service.id)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
            Nenhum serviço cadastrado para esta empresa.
          </p>
        )}
      </div>
    </div>
  );
}

function CompanySimulationTab({
  company,
  checkoutItems,
  upsertItem,
  removeItem,
  selectedItem,
}: {
  company: MarketCompany;
  checkoutItems: MarketCheckoutItemDraft[];
  upsertItem: (item: MarketCheckoutItemDraft) => void;
  removeItem: (itemId: string, itemType: MarketSimulationItemType) => void;
  selectedItem: { itemType: MarketSimulationItemType; itemId: string } | null;
}) {
  const [activeItemType, setActiveItemType] =
    useState<MarketSimulationItemType>(selectedItem?.itemType ?? "waste");
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(
    selectedItem?.itemId ?? "",
  );
  const [quantityDraft, setQuantityDraft] = useState("1");

  useEffect(() => {
    if (!selectedItem) return;
    setActiveItemType(selectedItem.itemType);
    setSelectedCatalogItemId(selectedItem.itemId);
  }, [selectedItem]);

  const catalogItems = getCatalogItems(company, activeItemType);
  const selectedCatalogItem =
    catalogItems.find((item) => item.id === selectedCatalogItemId) ?? null;

  useEffect(() => {
    if (!catalogItems.length) {
      setSelectedCatalogItemId("");
      return;
    }
    if (catalogItems.some((item) => item.id === selectedCatalogItemId)) return;
    setSelectedCatalogItemId(catalogItems[0].id);
  }, [catalogItems, selectedCatalogItemId]);

  const quantity = parseQuantity(quantityDraft);
  const unitPrice = selectedCatalogItem?.price ?? 0;
  const total = quantity * unitPrice;
  const orderTotal = checkoutItems.reduce((acc, item) => acc + item.total, 0);

  const handleAddItem = () => {
    if (!selectedCatalogItem || quantity <= 0) return;

    upsertItem({
      itemId: selectedCatalogItem.id,
      itemType: activeItemType,
      itemName: selectedCatalogItem.name,
      unit:
        MEASUREMENT_SYMBOL[selectedCatalogItem.unit] ??
        selectedCatalogItem.unit,
      unitPrice,
      quantity,
      total: quantity * unitPrice,
    });
    setQuantityDraft("1");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div>
          <h3 className="text-base font-semibold text-gray-950">Simulação</h3>
          <p className="text-sm text-muted-foreground">
            Selecione os itens e quantidades para montar sua simulação.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold",
              activeItemType === "waste"
                ? "bg-lime-800 text-white"
                : "bg-gray-100 text-gray-700",
            )}
            onClick={() => setActiveItemType("waste")}
            type="button"
          >
            Resíduos
          </button>
          <button
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold",
              activeItemType === "service"
                ? "bg-lime-800 text-white"
                : "bg-gray-100 text-gray-700",
            )}
            onClick={() => setActiveItemType("service")}
            type="button"
          >
            Serviços
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {catalogItems.length > 0 ? (
            catalogItems.map((item) => (
              <button
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-2 text-left",
                  item.id === selectedCatalogItem?.id
                    ? "border-lime-800 bg-lime-800/5"
                    : "border-gray-200 bg-white",
                )}
                key={item.id}
                onClick={() => setSelectedCatalogItemId(item.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="truncate text-xs text-gray-500">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-gray-800">
                    {formatCurrency(item.price)} /{" "}
                    {MEASUREMENT_SYMBOL[item.unit] ?? item.unit}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Este estabelecimento não possui itens nesta categoria.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div className="flex gap-3">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Quantidade</span>
            <input
              className="h-9 rounded-md border border-border px-2 text-sm outline-none focus:border-primary"
              inputMode="decimal"
              onChange={(event) => setQuantityDraft(event.target.value)}
              placeholder="0"
              type="text"
              value={quantityDraft}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Unidade</span>
            <input
              className="h-9 w-18 rounded-md border border-border bg-gray-100 px-2 text-sm text-gray-600 disabled:cursor-not-allowed"
              disabled
              value={
                selectedCatalogItem
                  ? (MEASUREMENT_SYMBOL[selectedCatalogItem.unit] ??
                    selectedCatalogItem.unit)
                  : ""
              }
            />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-md bg-lime-800/10 p-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-lime-800" strokeWidth={2} />
            <span className="text-sm text-lime-800">Total do item</span>
          </div>
          <span className="text-base font-bold text-lime-800">
            {formatCurrency(total)}
          </span>
        </div>

        <button
          className="h-11 cursor-pointer rounded-md bg-lime-800 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          disabled={!selectedCatalogItem || quantity <= 0}
          onClick={handleAddItem}
          type="button"
        >
          Adicionar à simulação
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-950">Lista</h3>
          <p className="text-sm text-muted-foreground">
            Itens adicionados à simulação desta empresa.
          </p>
        </div>

        {checkoutItems.length > 0 ? (
          checkoutItems.map((item) => (
            <div
              className="flex items-start justify-between gap-2 rounded-md border border-border bg-white p-3"
              key={`${item.itemType}-${item.itemId}`}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.itemName}
                </p>
                <p className="text-xs text-gray-500">
                  {item.itemType === "waste" ? "Resíduo" : "Serviço"} •{" "}
                  {formatQuantityLabel(item.quantity)} x{" "}
                  {formatCurrency(item.unitPrice)} / {item.unit}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.total)}
                </p>
                <button
                  aria-label={`Remover ${item.itemName}`}
                  className="flex size-7 cursor-pointer items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                  onClick={() => removeItem(item.itemId, item.itemType)}
                  type="button"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-border bg-white p-3 text-sm text-gray-500">
            Nenhum item adicionado à simulação.
          </p>
        )}

        <div className="flex items-center justify-between rounded-md bg-lime-800/10 p-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-lime-800" strokeWidth={2} />
            <span className="text-sm text-lime-800">Total geral</span>
          </div>
          <span className="text-base font-bold text-lime-800">
            {formatCurrency(orderTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailSheet({
  company,
  now,
  onClose,
}: {
  company: MarketCompany | null;
  now: Date;
  onClose: () => void;
}) {
  const open = company !== null;
  const companyId = company?.id ?? "";
  const {
    items: checkoutItems,
    upsertItem,
    removeItem,
  } = useMarketSimulation(companyId);
  const [activeTab, setActiveTab] = useState<"general" | "simulation">(
    "general",
  );
  const [isBusinessHoursSheetOpen, setIsBusinessHoursSheetOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    itemType: MarketSimulationItemType;
    itemId: string;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveTab("general");
      setIsBusinessHoursSheetOpen(false);
      setSelectedItem(null);
    }
  }, [open]);

  return (
    <>
      <button
        aria-label="Fechar detalhe da empresa"
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
          aria-label="Fechar detalhe da empresa"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        {company ? (
          <div className="scrollbar-none flex flex-1 flex-col overflow-y-auto px-4 pb-6">
            <div className="flex items-center gap-3 pt-4 pb-4">
              <CompanyLogo company={company} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-xl font-bold uppercase text-gray-900">
                  {company.business_name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {getCompanySubtitle(company)}
                </p>
                <CompanyBadges company={company} now={now} />
              </div>
            </div>

            <div className="flex shrink-0 gap-1 rounded-md border border-border p-1">
              <button
                className={cn(
                  "flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold",
                  activeTab === "general"
                    ? "bg-lime-800 text-white"
                    : "text-gray-600",
                )}
                onClick={() => setActiveTab("general")}
                type="button"
              >
                Geral
              </button>
              <button
                className={cn(
                  "flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold",
                  activeTab === "simulation"
                    ? "bg-lime-800 text-white"
                    : "text-gray-600",
                )}
                onClick={() => setActiveTab("simulation")}
                type="button"
              >
                Simulação
              </button>
            </div>

            <div className="pt-4">
              {activeTab === "general" ? (
                <CompanyGeneralTab
                  company={company}
                  now={now}
                  onOpenBusinessHours={() => setIsBusinessHoursSheetOpen(true)}
                  onSelectItem={(itemType, itemId) => {
                    setSelectedItem({ itemType, itemId });
                    setActiveTab("simulation");
                  }}
                />
              ) : (
                <CompanySimulationTab
                  checkoutItems={checkoutItems}
                  company={company}
                  removeItem={removeItem}
                  selectedItem={selectedItem}
                  upsertItem={upsertItem}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      <BusinessHoursSheet
        businessHours={company?.business_hours ?? []}
        onClose={() => setIsBusinessHoursSheetOpen(false)}
        open={isBusinessHoursSheetOpen}
      />
    </>
  );
}

function MarketListScreen() {
  useSetStatusBarVariant("dark");

  const [queryDraft, setQueryDraft] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedFilters>(DEFAULT_FILTERS);
  const [isRadiusSheetOpen, setIsRadiusSheetOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());

  const { companies: mockCompanies } = useMockCompanies();

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters((current) => ({
        ...current,
        query: queryDraft.trim() || null,
      }));
    }, 400);
    return () => clearTimeout(timer);
  }, [queryDraft]);

  const {
    companies: apiCompanies,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMarket({
    lat: CENTER[1],
    lon: CENTER[0],
    radius: appliedFilters.radius,
    query: appliedFilters.query,
    category: appliedFilters.category,
  });

  const companies = useMemo(() => {
    const fromMock = mockCompanies.map(mockCompanyToMarketCompany);
    return [...fromMock, ...apiCompanies];
  }, [mockCompanies, apiCompanies]);

  const radiusLabel =
    RADIUS_OPTIONS.find((option) => option.value === appliedFilters.radius)
      ?.label ?? `${appliedFilters.radius / 1000} km`;

  const selectedCompany =
    companies.find((company) => company.id === selectedCompanyId) ?? null;

  const toggleCategory = (category: Exclude<MarketCategory, null>) => {
    setAppliedFilters((current) => ({
      ...current,
      category: current.category === category ? null : category,
    }));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <div className="scrollbar-none h-full overflow-y-auto px-4 pb-8 pt-12">
        <div className="flex items-center gap-2 rounded-md border border-border bg-white p-2 shadow-sm">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <MapPin
              className="size-3.5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
            Rondonópolis, MT
          </p>
        </div>

        <div className="mt-3 flex h-12 items-center gap-2 rounded-md border border-border px-3">
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
          <input
            className="h-full w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-muted-foreground"
            data-demo-target="market-search"
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder="Empresas, resíduos ou serviços"
            value={queryDraft}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <FilterChip
            data-demo-target="market-filter-chip"
            icon={Recycle}
            label="Resíduos"
            onClick={() => toggleCategory("waste")}
            selected={appliedFilters.category === "waste"}
          />
          <FilterChip
            icon={Hammer}
            label="Serviços"
            onClick={() => toggleCategory("services")}
            selected={appliedFilters.category === "services"}
          />
          <button
            className="flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-white px-2 text-xs font-semibold text-gray-700"
            onClick={() => setIsRadiusSheetOpen(true)}
            type="button"
          >
            <Navigation className="size-3.5 shrink-0" strokeWidth={2.5} />
            Raio {radiusLabel}
          </button>
        </div>

        <div className="mt-4 mb-3 flex items-end justify-between">
          <h2 className="font-heading text-lg font-semibold text-gray-900">
            Ecossistema
          </h2>
          <span className="text-xs text-muted-foreground">
            {companies.length} resultados
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <CompanyCardSkeleton />
            <CompanyCardSkeleton />
            <CompanyCardSkeleton />
          </div>
        ) : companies.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada para os filtros aplicados.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {companies.map((company, index) => (
              <CompanyCard
                category={appliedFilters.category}
                company={company}
                index={index}
                key={company.id}
                now={now}
                onSelect={() => setSelectedCompanyId(company.id)}
              />
            ))}
          </div>
        )}

        {hasNextPage && !isLoading ? (
          <div className="mt-3 flex justify-center">
            <button
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-lime-800 disabled:cursor-not-allowed disabled:text-gray-400"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
              type="button"
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </button>
          </div>
        ) : null}
      </div>

      <RadiusSheet
        onClose={() => setIsRadiusSheetOpen(false)}
        onSelect={(radius) =>
          setAppliedFilters((current) => ({ ...current, radius }))
        }
        open={isRadiusSheetOpen}
        radius={appliedFilters.radius}
      />

      <CompanyDetailSheet
        company={selectedCompany}
        now={now}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
}

export { MarketListScreen };
