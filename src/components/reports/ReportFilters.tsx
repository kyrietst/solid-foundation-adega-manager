import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarIcon, Filter, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'thisWeek', label: 'Esta Semana' },
  { value: 'lastWeek', label: 'Semana Passada' },
  { value: 'thisMonth', label: 'Este Mês' },
  { value: 'lastMonth', label: 'Mês Passado' },
  { value: 'thisYear', label: 'Este Ano' },
  { value: 'custom', label: 'Personalizado' },
];

interface ReportFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  periodType: string;
  onPeriodTypeChange: (type: string) => void;
  categoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  sellerId?: string;
  onSellerChange: (sellerId: string) => void;
  paymentMethodId?: string;
  onPaymentMethodChange: (paymentMethodId: string) => void;
  onReset: () => void;
  isLoading?: boolean;
  className?: string;
  categories?: Array<{ id: string; name: string }>;
  sellers?: Array<{ id: string; name: string }>;
  paymentMethods?: Array<{ id: string; name: string }>;
}

export const ReportFilters = ({
  dateRange,
  onDateRangeChange,
  periodType,
  onPeriodTypeChange,
  categoryId,
  onCategoryChange,
  sellerId,
  onSellerChange,
  paymentMethodId,
  onPaymentMethodChange,
  onReset,
  isLoading = false,
  className = '',
  categories = [],
  sellers = [],
  paymentMethods = [],
}: ReportFiltersProps) => {
  const handlePeriodChange = (value: string) => {
    onPeriodTypeChange(value);
    const today = new Date();
    let newDateRange: DateRange = { from: today, to: today };

    switch (value) {
      case 'today':
        newDateRange = { from: today, to: today };
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        newDateRange = { from: yesterday, to: yesterday };
        break;
      case 'thisWeek':
        newDateRange = {
          from: startOfWeek(today, { locale: ptBR }),
          to: endOfWeek(today, { locale: ptBR }),
        };
        break;
      case 'lastWeek':
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        newDateRange = {
          from: startOfWeek(lastWeek, { locale: ptBR }),
          to: endOfWeek(lastWeek, { locale: ptBR }),
        };
        break;
      case 'thisMonth':
        newDateRange = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
        break;
      case 'lastMonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        newDateRange = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
        break;
      case 'thisYear':
        newDateRange = {
          from: new Date(today.getFullYear(), 0, 1),
          to: new Date(today.getFullYear(), 11, 31),
        };
        break;
      case 'custom':
        // Mantém o range atual
        return;
    }

    onDateRangeChange(newDateRange);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Seletor de Período */}
        <Select
          value={periodType}
          onValueChange={handlePeriodChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Seletor de Data Personalizada */}
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange(range);
                  onPeriodTypeChange('custom');
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={isLoading}
          title="Redefinir filtros"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading ? 'animate-spin' : '')} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Filtro de Categoria */}
        <Select
          value={categoryId || ''}
          onValueChange={onCategoryChange}
          disabled={isLoading || categories.length === 0}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={categories.length > 0 ? "Todas as Categorias" : "Nenhuma categoria"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Vendedor */}
        <Select
          value={sellerId || ''}
          onValueChange={onSellerChange}
          disabled={isLoading || sellers.length === 0}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={sellers.length > 0 ? "Todos os Vendedores" : "Nenhum vendedor"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Vendedores</SelectItem>
            {sellers.map((seller) => (
              <SelectItem key={seller.id} value={seller.id}>
                {seller.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Forma de Pagamento */}
        <Select
          value={paymentMethodId || ''}
          onValueChange={onPaymentMethodChange}
          disabled={isLoading || paymentMethods.length === 0}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder={paymentMethods.length > 0 ? "Todas as Formas de Pagamento" : "Nenhuma forma de pagamento"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Formas de Pagamento</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
