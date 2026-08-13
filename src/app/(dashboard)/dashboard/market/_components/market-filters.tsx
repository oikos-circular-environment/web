"use client";

import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_RADIUS, useMarketContext } from "@/contexts/market-context";

const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
  { value: 200, label: "200 km" },
  { value: 500, label: "500 km" },
];

export function MarketFilters() {
  const { filters, setQuery, setRadius, setCategory } = useMarketContext();
  const searchId = useId();
  const [searchValue, setSearchValue] = useState(filters.query);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontalIcon className="size-4" />
        Filtros
      </div>

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={searchId}>Buscar</FieldLabel>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={searchId}
              type="search"
              placeholder="Nome, serviço ou resíduo"
              className="pl-9"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setQuery(searchValue);
                }
              }}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setCategory(value as "services" | "waste" | "")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="services">Serviços</SelectItem>
              <SelectItem value="waste">Resíduos</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Raio</FieldLabel>
          <Select
            value={String(filters.radius ?? DEFAULT_RADIUS)}
            onValueChange={(value) => setRadius(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Raio" />
            </SelectTrigger>
            <SelectContent>
              {radiusOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => setQuery(searchValue)}
            className="w-full"
          >
            <SearchIcon />
            Buscar
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
}
