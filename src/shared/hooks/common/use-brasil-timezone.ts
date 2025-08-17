/**
 * Hook para formatação de datas no fuso horário de São Paulo/Brasil
 * Converte timestamps UTC para o horário local brasileiro
 */

import { useMemo } from 'react';

export interface BrasilTimezoneOptions {
  showSeconds?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  dateFormat?: 'short' | 'long';
  timeFormat?: '12h' | '24h';
}

export const useBrasilTimezone = () => {
  // Função para converter UTC para horário de São Paulo
  const convertToSaoPaulo = useMemo(() => {
    return (utcTimestamp: string | Date): Date => {
      const date = typeof utcTimestamp === 'string' 
        ? new Date(utcTimestamp) 
        : utcTimestamp;
      
      // Converter para horário de São Paulo (UTC-3)
      // Note: JavaScript Date já faz a conversão automática baseada no fuso local,
      // mas vamos garantir que sempre mostre horário de SP
      return new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    };
  }, []);

  // Função para formatar data/hora no padrão brasileiro
  const formatBrazilian = useMemo(() => {
    return (
      utcTimestamp: string | Date, 
      options: BrasilTimezoneOptions = {}
    ): string => {
      const {
        showSeconds = true,
        showDate = true,
        showTime = true,
        dateFormat = 'short',
        timeFormat = '24h'
      } = options;

      const spDate = convertToSaoPaulo(utcTimestamp);
      
      let formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Sao_Paulo'
      };

      if (showDate) {
        formatOptions.day = '2-digit';
        formatOptions.month = '2-digit';
        formatOptions.year = 'numeric';
      }

      if (showTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
        if (showSeconds) {
          formatOptions.second = '2-digit';
        }
        formatOptions.hour12 = timeFormat === '12h';
      }

      return spDate.toLocaleString('pt-BR', formatOptions);
    };
  }, [convertToSaoPaulo]);

  // Função específica para mostrar apenas data
  const formatDate = useMemo(() => {
    return (utcTimestamp: string | Date): string => {
      return formatBrazilian(utcTimestamp, {
        showDate: true,
        showTime: false
      });
    };
  }, [formatBrazilian]);

  // Função específica para mostrar apenas hora
  const formatTime = useMemo(() => {
    return (utcTimestamp: string | Date): string => {
      return formatBrazilian(utcTimestamp, {
        showDate: false,
        showTime: true,
        showSeconds: false
      });
    };
  }, [formatBrazilian]);

  // Função para formato compacto (dd/mm/yyyy hh:mm)
  const formatCompact = useMemo(() => {
    return (utcTimestamp: string | Date): string => {
      return formatBrazilian(utcTimestamp, {
        showDate: true,
        showTime: true,
        showSeconds: false
      });
    };
  }, [formatBrazilian]);

  // Função para formato relativo (há X minutos, há X horas, etc.)
  const formatRelative = useMemo(() => {
    return (utcTimestamp: string | Date): string => {
      const spDate = convertToSaoPaulo(utcTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - spDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'agora mesmo';
      if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
      if (diffHours < 24) return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
      if (diffDays < 30) return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
      
      // Para datas mais antigas, mostrar data completa
      return formatDate(utcTimestamp);
    };
  }, [convertToSaoPaulo, formatDate]);

  return {
    convertToSaoPaulo,
    formatBrazilian,
    formatDate,
    formatTime,
    formatCompact,
    formatRelative,
    
    // Helpers
    getCurrentSaoPauloTime: () => convertToSaoPaulo(new Date()),
    isToday: (utcTimestamp: string | Date) => {
      const spDate = convertToSaoPaulo(utcTimestamp);
      const today = convertToSaoPaulo(new Date());
      return spDate.toDateString() === today.toDateString();
    }
  };
};

// Hook específico para componentes que precisam apenas de formatação simples
export const useFormatBrazilianDate = () => {
  const { formatCompact, formatRelative, formatDate, formatTime } = useBrasilTimezone();
  
  return {
    formatCompact,
    formatRelative,
    formatDate,
    formatTime
  };
};