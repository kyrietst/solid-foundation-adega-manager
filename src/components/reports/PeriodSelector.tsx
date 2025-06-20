import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface PeriodOption {
  id: PeriodType;
  label: string;
  getRange: () => { from: Date; to: Date };
}

interface PeriodSelectorProps {
  value: { from?: Date; to?: Date };
  periodType: PeriodType;
  onChange: (range: { from?: Date; to?: Date }, periodType: PeriodType) => void;
  className?: string;
}

export const PeriodSelector = ({
  value,
  periodType,
  onChange,
  className = '',
}: PeriodSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [localRange, setLocalRange] = useState<{ from?: Date; to?: Date }>(value);
  
  // Atualiza o range local quando o valor externo muda
  useEffect(() => {
    setLocalRange(value);
  }, [value]);

  const today = new Date();
  
  const periodOptions: PeriodOption[] = [
    {
      id: 'day',
      label: 'Hoje',
      getRange: () => ({
        from: today,
        to: today,
      }),
    },
    {
      id: 'week',
      label: 'Esta semana',
      getRange: () => ({
        from: startOfWeek(today, { locale: ptBR }),
        to: endOfWeek(today, { locale: ptBR }),
      }),
    },
    {
      id: 'month',
      label: 'Este mês',
      getRange: () => ({
        from: startOfMonth(today),
        to: endOfMonth(today),
      }),
    },
    {
      id: 'quarter',
      label: 'Este trimestre',
      getRange: () => ({
        from: startOfQuarter(today),
        to: endOfQuarter(today),
      }),
    },
    {
      id: 'year',
      label: 'Este ano',
      getRange: () => ({
        from: startOfYear(today),
        to: endOfYear(today),
      }),
    },
    {
      id: 'custom',
      label: 'Personalizado',
      getRange: () => ({
        from: subDays(today, 30),
        to: today,
      }),
    },
  ];

  const selectedOption = periodOptions.find(opt => opt.id === periodType) || periodOptions[2]; // Default para 'Este mês'
  
  const handlePeriodSelect = (option: PeriodOption) => {
    if (option.id === 'custom') {
      setIsCalendarOpen(true);
      setIsOpen(false);
    } else {
      const range = option.getRange();
      onChange(range, option.id);
      setIsOpen(false);
    }
  };

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    setLocalRange(range);
    
    // Verifica se ambas as datas estão definidas
    if (range.from && range.to) {
      onChange(range, 'custom');
      setIsCalendarOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!localRange.from && !localRange.to) return 'Selecione um período';
    
    const formatDate = (date?: Date) => {
      if (!date) return '';
      return format(date, 'dd MMM yyyy', { locale: ptBR });
    };
    
    if (periodType === 'day' && localRange.from) {
      return format(localRange.from, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    }
    
    const from = formatDate(localRange.from);
    const to = formatDate(localRange.to);
    
    return from === to ? from : `${from} - ${to}`;
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultRange = periodOptions[2].getRange(); // Default para 'Este mês'
    onChange(defaultRange, 'month');
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Seletor de Período */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal flex-1 min-w-[200px]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{selectedOption.label}</span>
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="py-1">
            {periodOptions.map((option) => (
              <button
                key={option.id}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                  selectedOption.id === option.id && 'bg-accent font-medium'
                )}
                onClick={() => handlePeriodSelect(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Exibição do intervalo de datas */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal flex-1 min-w-[250px]',
              !localRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{formatDateRange()}</span>
            {localRange && (
              <X 
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                onClick={clearSelection}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={localRange?.from}
            selected={localRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      
      {/* Indicador de período personalizado */}
      {periodType === 'custom' && (
        <div className="text-sm text-muted-foreground hidden md:block">
          {localRange.from && localRange.to && (
            <span>
              {format(localRange.from, 'd MMM yyyy', { locale: ptBR })} -{' '}
              {format(localRange.to, 'd MMM yyyy', { locale: ptBR })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
