"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libs/utils";

function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecione uma data",
  className,
}: {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "w-56 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {date ? date.toLocaleDateString("pt-BR") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => {
            onDateChange?.(next);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
