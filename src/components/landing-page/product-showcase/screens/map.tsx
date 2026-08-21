"use client";

import { Hammer, MapPin, Recycle, Sprout } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const mockCompanies = [
  {
    id: "1",
    business_name: "EcoRecicla Santos",
    identity: "12.345.678/0001-90",
    distance_in_meters: 450,
    isOpen: true,
    company_type: "COMPANY",
    wastes: [{ id: "w1", name: "Plástico" }],
    services: [{ id: "s1", name: "Coleta" }],
  },
  {
    id: "2",
    business_name: "Coletor Independente Zona Norte",
    identity: null,
    distance_in_meters: 1200,
    isOpen: false,
    company_type: "COLLECTOR",
    wastes: [{ id: "w2", name: "Papel" }],
    services: [],
  },
  {
    id: "3",
    business_name: "Reciclagem Verde",
    identity: "98.765.432/0001-10",
    distance_in_meters: 2100,
    isOpen: true,
    company_type: "COMPANY",
    wastes: [
      { id: "w3", name: "Metal" },
      { id: "w4", name: "Vidro" },
    ],
    services: [{ id: "s2", name: "Triagem" }],
  },
];

function formatDistance(meters: number) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function maskCnpj(value: string) {
  return value.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function MapScreen() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Próximo a você</p>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="font-heading text-lg">Santos, SP</p>
          </div>
        </div>
        <Badge variant="secondary">5 pontos</Badge>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto p-4">
        {mockCompanies.map((company) => (
          <Card className="shadow-none" key={company.id} size="sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary">
                  {company.company_type === "COLLECTOR" ? (
                    <Sprout className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-primary-foreground">
                      {company.business_name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() ?? "")
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-bold uppercase">
                    {company.business_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.identity
                      ? maskCnpj(company.identity)
                      : "Coletor independente"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="secondary">
                      {formatDistance(company.distance_in_meters)}
                    </Badge>
                    {company.company_type === "COLLECTOR" && (
                      <Badge variant="default">Coletor</Badge>
                    )}
                    <Badge variant={company.isOpen ? "default" : "destructive"}>
                      {company.isOpen ? "Aberto" : "Fechado"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {company.wastes.map((waste) => (
                  <Badge
                    className="gap-1.5 px-3 py-2"
                    key={waste.id}
                    variant="secondary"
                  >
                    <Recycle className="h-3.5 w-3.5" />
                    {waste.name}
                  </Badge>
                ))}
                {company.services.map((service) => (
                  <Badge
                    className="gap-1.5 px-3 py-2"
                    key={service.id}
                    variant="secondary"
                  >
                    <Hammer className="h-3.5 w-3.5" />
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { MapScreen };
