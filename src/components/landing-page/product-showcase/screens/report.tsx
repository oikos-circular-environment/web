"use client";

import { List, MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const mockComplaints = [
  {
    id: "c1",
    number: "#1234",
    status: "Pendente",
    color: "bg-muted-foreground",
    date: "Hoje, 09:14",
    address: "Av. Ana Costa, 345",
  },
  {
    id: "c2",
    number: "#1230",
    status: "Em análise",
    color: "bg-primary",
    date: "Ontem, 16:40",
    address: "Rua Goiás, 1200",
  },
  {
    id: "c3",
    number: "#1198",
    status: "Resolvida",
    color: "bg-green-600",
    date: "20 ago",
    address: "Praia do Gonzaga",
  },
];

const pins = [
  { id: "pin-1", left: "28%", top: "34%" },
  { id: "pin-2", left: "62%", top: "48%" },
  { id: "pin-3", left: "44%", top: "66%" },
];

function ReportScreen() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#e8e6df]">
      <div className="absolute inset-0 opacity-40">
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 340 680">
          <pattern
            height="40"
            id="grid"
            patternUnits="userSpaceOnUse"
            width="40"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
            />
          </pattern>
          <rect fill="url(#grid)" height="680" width="340" />
        </svg>
      </div>

      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Denúncias próximas</span>
        </div>
        <Badge variant="secondary">3 km</Badge>
      </div>

      {pins.map((pin) => (
        <div
          className="absolute z-10"
          key={pin.id}
          style={{ left: pin.left, top: pin.top }}
        >
          <div className="relative">
            <svg aria-hidden="true" height="38" viewBox="0 0 32 40" width="30">
              <path
                d="M4.74,21.5 A13,13 0 1 1 27.26,21.5 L18.6,36.5 A3,3 0 0 1 13.4,36.5 Z"
                fill="#f59e0b"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex justify-end gap-2">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md"
            type="button"
          >
            <List className="h-5 w-5 text-gray-700" />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-800 shadow-md"
            type="button"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
        </div>

        <Card className="max-h-56 overflow-y-auto shadow-md" size="sm">
          <div className="flex flex-col gap-3">
            {mockComplaints.map((complaint) => (
              <div
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                key={complaint.id}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">
                    Denúncia {complaint.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {complaint.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {complaint.date}
                  </p>
                </div>
                <Badge
                  className={`text-white ${complaint.color}`}
                  variant="default"
                >
                  {complaint.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export { ReportScreen };
