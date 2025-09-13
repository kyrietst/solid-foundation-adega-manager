/**
 * Hook para formatação padronizada de dados
 * Centraliza todas as funções de formatação da aplicação
 */

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FormattingOptions {
  currency?: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
  date?: {
    locale?: any;
    format?: string;
  };
  phone?: {
    maskBrazilianFormat?: boolean;
  };
  cpf?: {
    maskFormat?: boolean;
  };
}

export const useFormatting = (options: FormattingOptions = {}) => {
  const formatters = useMemo(() => {
    // Configurações padrão
    const defaultCurrencyConfig = {
      locale: 'pt-BR',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options.currency,
    };

    const defaultDateConfig = {
      locale: ptBR,
      format: 'dd/MM/yyyy',
      ...options.date,
    };

    return {
      // Formatação de moeda - usando a função existente como base
      currency: (amount: number): string => {
        return new Intl.NumberFormat(defaultCurrencyConfig.locale, {
          style: 'currency',
          currency: defaultCurrencyConfig.currency,
          minimumFractionDigits: defaultCurrencyConfig.minimumFractionDigits,
          maximumFractionDigits: defaultCurrencyConfig.maximumFractionDigits,
        }).format(amount);
      },

      // Formatação de data
      date: (date: Date | string | number): string => {
        const dateObj = typeof date === 'string' || typeof date === 'number' 
          ? new Date(date) 
          : date;
        
        return format(dateObj, defaultDateConfig.format, {
          locale: defaultDateConfig.locale,
        });
      },

      // Formatação de data e hora
      datetime: (date: Date | string | number): string => {
        const dateObj = typeof date === 'string' || typeof date === 'number' 
          ? new Date(date) 
          : date;
        
        return format(dateObj, 'dd/MM/yyyy HH:mm', {
          locale: defaultDateConfig.locale,
        });
      },

      // Formatação de telefone brasileiro
      phone: (phone: string): string => {
        if (!phone) return '';
        
        // Remove todos os caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');
        
        // Aplicar máscara brasileira
        if (cleaned.length === 11) {
          // Celular: (00) 00000-0000
          return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
          // Fixo: (00) 0000-0000
          return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return cleaned;
      },

      // Formatação de CPF
      cpf: (cpf: string): string => {
        if (!cpf) return '';
        
        // Remove todos os caracteres não numéricos
        const cleaned = cpf.replace(/\D/g, '');
        
        // Aplicar máscara CPF: 000.000.000-00
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        return cleaned;
      },

      // Formatação de CNPJ
      cnpj: (cnpj: string): string => {
        if (!cnpj) return '';
        
        // Remove todos os caracteres não numéricos
        const cleaned = cnpj.replace(/\D/g, '');
        
        // Aplicar máscara CNPJ: 00.000.000/0000-00
        if (cleaned.length === 14) {
          return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        return cleaned;
      },

      // Formatação de percentual
      percentage: (value: number, decimals: number = 1): string => {
        return `${value.toFixed(decimals)}%`;
      },

      // Formatação de números com separador de milhares
      number: (value: number): string => {
        return new Intl.NumberFormat('pt-BR').format(value);
      },

      // Formatação compacta para números grandes (1.2K, 1.5M)
      numberCompact: (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(value);
      },
    };
  }, [options]);

  return formatters;
};

// Hook específico para formatCurrency (mantém compatibilidade)
export const useCurrencyFormatter = () => {
  const { currency } = useFormatting();
  return currency;
};

// Hook específico para formatDate (mantém compatibilidade)  
export const useDateFormatter = () => {
  const { date, datetime } = useFormatting();
  return { date, datetime };
};