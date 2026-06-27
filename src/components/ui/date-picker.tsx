"use client";

import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { SelectHandler } from "react-day-picker";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  value?: Date;
  onChange?: SelectHandler<{ mode: "single" }> | Date;
  fromYear?: number;
  toYear?: number;
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  triggerClassName?: string;
}

export const DatePicker = ({
  value,
  onChange,
  fromYear,
  toYear,
  captionLayout = "dropdown",
  triggerClassName,
}: DatePickerProps) => {
  const currentYear = new Date().getFullYear();
  const effectiveFromYear = fromYear ?? 1901;
  const effectiveToYear = toYear ?? currentYear + 20;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            new Date(value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          ) : (
            <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          //   onSelect={onChange as OnSelectHandler<Date>}
          locale={ptBR} // traduz os meses do calendário para português
          captionLayout={captionLayout}
          // toDate={new Date()} // faz com que a data máxima seja a do dia atual
        />
      </PopoverContent>
    </Popover>
  );
};
