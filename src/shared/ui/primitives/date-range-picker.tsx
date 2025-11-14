import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/core/config/utils";
import { Button } from "@/shared/ui/primitives/button";
import { Calendar } from "@/shared/ui/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";

interface DateRangePickerProps {
  /**
   * Selected date range
   */
  dateRange?: DateRange;
  /**
   * Callback when date range changes
   */
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  disabled = false,
  placeholder = "Selecione o período",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange);

  // Atualizar estado interno quando a prop mudar
  React.useEffect(() => {
    setDate(dateRange);
  }, [dateRange]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateRangeChange?.(newDate);
  };

  const formatDateRange = () => {
    if (!date?.from) {
      return <span>{placeholder}</span>;
    }

    if (date.to) {
      return (
        <>
          {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
          {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
        </>
      );
    }

    return format(date.from, "dd/MM/yyyy", { locale: ptBR });
  };

  // Presets de datas comuns
  const presets = [
    {
      label: "Últimos 7 dias",
      getValue: () => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 7);
        return { from, to: today };
      },
    },
    {
      label: "Últimos 30 dias",
      getValue: () => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 30);
        return { from, to: today };
      },
    },
    {
      label: "Últimos 90 dias",
      getValue: () => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 90);
        return { from, to: today };
      },
    },
    {
      label: "Este mês",
      getValue: () => {
        const today = new Date();
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from, to: today };
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-black/50 border-white/20 text-white hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-400 transition-colors",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-black/95 backdrop-blur-xl border border-white/30 shadow-2xl"
          align="start"
        >
          <div className="flex">
            {/* Presets sidebar */}
            <div className="flex flex-col gap-1 p-4 border-r border-white/20 bg-black/30 min-w-[140px]">
              <div className="text-xs font-semibold text-yellow-400 mb-2 uppercase tracking-wider">
                Períodos
              </div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-300 text-xs font-medium transition-colors"
                  onClick={() => handleSelect(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
              <div className="border-t border-white/10 my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-red-400 hover:bg-yellow-500/20 hover:text-yellow-300 text-xs font-medium transition-colors"
                onClick={() => handleSelect(undefined)}
              >
                Limpar filtro
              </Button>
            </div>

            {/* Calendar */}
            <div className="p-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={ptBR}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
