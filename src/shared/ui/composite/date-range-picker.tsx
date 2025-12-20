"use client"

import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X, Check } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/core/config/utils"
import { Button } from "@/shared/ui/primitives/button"
import { Calendar } from "@/shared/ui/primitives/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/primitives/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const [open, setOpen] = React.useState(false)

    const presets = [
        {
            label: 'Hoje',
            getValue: () => ({
                from: new Date(),
                to: new Date()
            })
        },
        {
            label: 'Ontem',
            getValue: () => ({
                from: subDays(new Date(), 1),
                to: subDays(new Date(), 1)
            })
        },
        {
            label: 'Últimos 7 dias',
            getValue: () => ({
                from: subDays(new Date(), 7),
                to: new Date()
            })
        },
        {
            label: 'Últimos 30 dias',
            getValue: () => ({
                from: subDays(new Date(), 30),
                to: new Date()
            })
        },
        {
            label: 'Este Mês',
            getValue: () => ({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date())
            })
        },
        {
            label: 'Mês Passado',
            getValue: () => ({
                from: startOfMonth(subMonths(new Date(), 1)),
                to: endOfMonth(subMonths(new Date(), 1))
            })
        },
    ]

    const handlePresetSelect = (preset: { getValue: () => DateRange }) => {
        setDate(preset.getValue())
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal bg-black/40 border-yellow-500/30 text-white hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/50 transition-all duration-300",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-yellow-500" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                    {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                                </>
                            ) : (
                                format(date.from, "dd/MM/yyyy", { locale: ptBR })
                            )
                        ) : (
                            <span>Selecione um período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-950/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl ring-1 ring-black/20" align="end">
                    <div className="flex flex-row">
                        {/* Sidebar de Presets */}
                        <div className="w-[160px] border-r border-white/5 p-3 flex flex-col gap-1.5 bg-white/[0.02] rounded-l-xl">
                            <span className="text-[0.65rem] font-bold text-zinc-500 px-3 py-1 mb-1 uppercase tracking-widest">Períodos</span>
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handlePresetSelect(preset)}
                                    className="flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all text-left outline-none focus:bg-yellow-500/10 focus:text-yellow-400 group relative"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {preset.label}
                                </button>
                            ))}

                            {date && (
                                <>
                                    <div className="my-2 border-t border-white/5 mx-2" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDate(undefined);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left group"
                                    >
                                        <X className="h-3.5 w-3.5 mr-2 opacity-70 group-hover:opacity-100" />
                                        Limpar Filtro
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Calendário Único */}
                        <div className="p-0">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Período Selecionado</span>
                                    <span className="text-sm font-semibold text-white">
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "dd/MM/yyyy", { locale: ptBR })}
                                                    <span className="text-zinc-600 mx-2">•</span>
                                                    {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                                                </>
                                            ) : (
                                                format(date.from, "dd 'de' MMMM", { locale: ptBR })
                                            )
                                        ) : (
                                            "Selecione as datas"
                                        )}
                                    </span>
                                </div>
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={1}
                                locale={ptBR}
                                className="bg-transparent text-white p-4"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
