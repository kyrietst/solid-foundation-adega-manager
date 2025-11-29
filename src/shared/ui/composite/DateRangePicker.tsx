import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/core/config/utils"
import { Button } from "@/shared/ui/primitives/button"
import { Calendar } from "@/shared/ui/primitives/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/primitives/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/primitives/select"

interface DateRangePickerProps {
    className?: string
    date: DateRange | undefined
    onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
    className,
    date,
    onDateChange,
}: DateRangePickerProps) {
    const [preset, setPreset] = React.useState<string>("this_month")

    const handlePresetChange = (value: string) => {
        setPreset(value)
        const today = new Date()

        switch (value) {
            case "today":
                onDateChange({
                    from: startOfDay(today),
                    to: endOfDay(today),
                })
                break
            case "yesterday":
                const yesterday = subDays(today, 1)
                onDateChange({
                    from: startOfDay(yesterday),
                    to: endOfDay(yesterday),
                })
                break
            case "this_month":
                onDateChange({
                    from: startOfMonth(today),
                    to: endOfDay(today),
                })
                break
            case "last_month":
                const lastMonth = subMonths(today, 1)
                onDateChange({
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth),
                })
                break
            case "last_7_days":
                onDateChange({
                    from: subDays(today, 7),
                    to: endOfDay(today),
                })
                break
            case "last_30_days":
                onDateChange({
                    from: subDays(today, 30),
                    to: endOfDay(today),
                })
                break
            case "custom":
                // Keep current selection or reset if undefined
                break
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal bg-black/80 border-white/10 text-white hover:bg-white/5",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/y", { locale: ptBR })} -{" "}
                                    {format(date.to, "dd/MM/y", { locale: ptBR })}
                                </>
                            ) : (
                                format(date.from, "dd/MM/y", { locale: ptBR })
                            )
                        ) : (
                            <span>Selecione um período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="end">
                    <div className="p-3 border-b border-gray-700">
                        <Select value={preset} onValueChange={handlePresetChange}>
                            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                <SelectItem value="today">Hoje</SelectItem>
                                <SelectItem value="yesterday">Ontem</SelectItem>
                                <SelectItem value="this_month">Este Mês</SelectItem>
                                <SelectItem value="last_month">Mês Passado</SelectItem>
                                <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                                <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate) => {
                            onDateChange(newDate)
                            setPreset("custom")
                        }}
                        numberOfMonths={2}
                        locale={ptBR}
                        className="text-white"
                        classNames={{
                            day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                            day_today: "bg-gray-800 text-white",
                            day: "hover:bg-gray-700 rounded-md",
                            head_cell: "text-gray-400",
                            caption_label: "text-white font-medium",
                            nav_button: "text-gray-400 hover:text-white hover:bg-gray-700",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
