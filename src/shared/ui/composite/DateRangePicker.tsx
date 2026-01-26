import * as React from "react"
import { Calendar as CalendarIcon, Check } from "lucide-react"
import { addDays, format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays, isSameDay } from "date-fns"
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

    const handlePresetSelect = (value: string) => {
        setPreset(value)
        const today = new Date()

        switch (value) {
            case "today":
                onDateChange({
                    from: startOfDay(today),
                    to: endOfDay(today),
                })
                break
            case "yesterday": {
                const yesterday = subDays(today, 1)
                onDateChange({
                    from: startOfDay(yesterday),
                    to: endOfDay(yesterday),
                })
                break
            }
            case "last_7_days":
                onDateChange({
                    from: subDays(today, 6), // 7 days inclusive
                    to: endOfDay(today),
                })
                break
            case "last_30_days":
                onDateChange({
                    from: subDays(today, 29), // 30 days inclusive
                    to: endOfDay(today),
                })
                break
            case "this_month":
                onDateChange({
                    from: startOfMonth(today),
                    to: endOfDay(today),
                })
                break
            case "last_month": {
                const lastMonth = subMonths(today, 1)
                onDateChange({
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth),
                })
                break
            }
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
                            "w-[260px] justify-start text-left font-normal bg-black/40 border-white/10 text-white hover:bg-white/5 hover:border-[#f9cb15]/50 transition-colors",
                            !date && "text-muted-foreground",
                            date && "border-[#f9cb15]/30 text-[#f9cb15]"
                        )}
                    >
                        <CalendarIcon className={cn("mr-2 h-4 w-4", date ? "text-[#f9cb15]" : "text-zinc-500")} />
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
                            <span className="text-zinc-500">Selecione um período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#09090b] border-white/10 shadow-2xl rounded-xl overflow-hidden" align="end">
                    <div className="flex flex-row">
                        {/* Sidebar Presets */}
                        <div className="flex flex-col border-r border-white/5 bg-zinc-900/50 p-3 w-[160px] gap-1">
                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 px-2">Períodos</p>
                            
                            {[
                                { id: "today", label: "Hoje" },
                                { id: "yesterday", label: "Ontem" },
                                { id: "last_7_days", label: "Últimos 7 dias" },
                                { id: "last_30_days", label: "Últimos 30 dias" },
                                { id: "this_month", label: "Este Mês" },
                                { id: "last_month", label: "Mês Passado" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handlePresetSelect(item.id)}
                                    className={cn(
                                        "text-sm px-3 py-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between group",
                                        preset === item.id
                                            ? "bg-[#f9cb15]/10 text-[#f9cb15] font-medium border border-[#f9cb15]/20 shadow-sm"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {item.label}
                                    {preset === item.id && <Check className="h-3 w-3 text-[#f9cb15]" />}
                                </button>
                            ))}
                        </div>

                        {/* Calendar Area */}
                        <div className="p-3">
                            <div className="mb-4 px-3 pt-2">
                                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Período Selecionado</p>
                                <p className="text-sm font-bold text-white">
                                    {date?.from ? (
                                        date.to ? (
                                            `${format(date.from, "dd 'de' MMMM", { locale: ptBR })} - ${format(date.to, "dd 'de' MMMM", { locale: ptBR })}`
                                        ) : (
                                            format(date.from, "dd 'de' MMMM", { locale: ptBR })
                                        )
                                    ) : (
                                        "Selecione as datas"
                                    )}
                                </p>
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(newDate) => {
                                    if (newDate?.to) {
                                        newDate.to = endOfDay(newDate.to)
                                    }
                                    onDateChange(newDate)
                                    setPreset("custom")
                                }}
                                numberOfMonths={1}
                                locale={ptBR}
                                className="bg-transparent"
                                classNames={{
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center mb-2",
                                    caption_label: "text-white text-sm font-bold uppercase tracking-wide",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10 rounded-full transition-all",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] uppercase",
                                    row: "flex w-full mt-2",
                                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected])]:bg-white/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-9 w-9 p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-md transition-colors",
                                    day_range_end: "day-range-end",
                                    day_selected: "bg-[#f9cb15] text-black hover:bg-[#f9cb15] hover:text-black focus:bg-[#f9cb15] focus:text-black font-bold shadow-[0_0_10px_rgba(249,203,21,0.5)] rounded-md !important",
                                    day_today: "bg-zinc-800 text-white border border-white/20",
                                    day_outside: "text-zinc-700 opacity-50",
                                    day_disabled: "text-zinc-700 opacity-50",
                                    day_range_middle: "aria-selected:bg-[#f9cb15]/20 aria-selected:text-[#f9cb15]",
                                    day_hidden: "invisible",
                                }}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
