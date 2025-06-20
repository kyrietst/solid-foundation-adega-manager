import { useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays } from 'date-fns';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ReportFilters {
  dateRange: DateRange | undefined;
  periodType: PeriodType;
  categoryId?: string;
  sellerId?: string;
  paymentMethodId?: string;
  customerId?: string;
}

export const useReportFilters = (initialPeriod: PeriodType = 'month') => {
  const today = new Date();
  const [periodType, setPeriodType] = useState<PeriodType>(initialPeriod);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    switch (initialPeriod) {
      case 'day':
        return { from: today, to: today };
      case 'week':
        return { from: startOfWeek(today), to: endOfWeek(today) };
      case 'month':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'quarter':
        return { from: startOfQuarter(today), to: endOfQuarter(today) };
      case 'year':
        return { from: startOfYear(today), to: endOfYear(today) };
      default:
        return { from: subDays(today, 30), to: today };
    }
  });
  const [categoryId, setCategoryId] = useState<string>();
  const [sellerId, setSellerId] = useState<string>();
  const [paymentMethodId, setPaymentMethodId] = useState<string>();
  const [customerId, setCustomerId] = useState<string>();

  // opções estáticas por enquanto; futuramente podem vir do backend
  const periodOptions = [
    { value: 'day', label: 'Diário' },
    { value: 'week', label: 'Semanal' },
    { value: 'month', label: 'Mensal' }
  ];
  const categoryOptions: { value: string; label: string }[] = [];
  const sellerOptions: { value: string; label: string }[] = [];
  const paymentMethodOptions: { value: string; label: string }[] = [];




  const updatePeriod = useCallback((newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    
    const today = new Date();
    let newDateRange: DateRange = { from: today, to: today };
    
    switch (newPeriod) {
      case 'day':
        newDateRange = { from: today, to: today };
        break;
      case 'week':
        newDateRange = { 
          from: startOfWeek(today, { weekStartsOn: 1 }), 
          to: endOfWeek(today, { weekStartsOn: 1 }) 
        };
        break;
      case 'month':
        newDateRange = { 
          from: startOfMonth(today), 
          to: endOfMonth(today) 
        };
        break;
      case 'quarter':
        newDateRange = { 
          from: startOfQuarter(today), 
          to: endOfQuarter(today) 
        };
        break;
      case 'year':
        newDateRange = { 
          from: startOfYear(today), 
          to: endOfYear(today) 
        };
        break;
      case 'custom':
        // Mantém o range atual se já estiver definido
        newDateRange = dateRange || { from: subDays(today, 30), to: today };
        break;
    }
    
    setDateRange(newDateRange);
  }, [dateRange]);

  const updateDateRange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setPeriodType('custom');
    }
  }, []);

  const resetFilters = useCallback(() => {
    updatePeriod('month');
    setCategoryId(undefined);
    setSellerId(undefined);
    setPaymentMethodId(undefined);
    setCustomerId(undefined);
  }, [updatePeriod]);

  const filtersObj = {
    dateRange,
    periodType,
    categoryId,
    sellerId,
    paymentMethodId,
    customerId,
  } as const;

  // setter genérico para ReportsDashboard
  const setFilters = (
    updater: (prev: typeof filtersObj) => typeof filtersObj
  ) => {
    const newFilters = updater(filtersObj);
    if (newFilters.dateRange !== dateRange) setDateRange(newFilters.dateRange);
    if (newFilters.periodType !== periodType) updatePeriod(newFilters.periodType);
    if (newFilters.categoryId !== categoryId) setCategoryId(newFilters.categoryId);
    if (newFilters.sellerId !== sellerId) setSellerId(newFilters.sellerId);
    if (newFilters.paymentMethodId !== paymentMethodId) setPaymentMethodId(newFilters.paymentMethodId);
    if (newFilters.customerId !== customerId) setCustomerId(newFilters.customerId);
  };

  return {
    filters: filtersObj,
    setFilters,
    periodOptions,
    categoryOptions,
    sellerOptions,
    paymentMethodOptions,
    updatePeriod,
    updateDateRange,
    resetFilters,
  };
};
