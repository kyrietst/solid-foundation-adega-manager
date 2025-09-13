/**
 * Componente para exibição de valores formatados
 * Centraliza a apresentação de dados formatados com suporte a tooltips e variações visuais
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { useFormatting, FormattingOptions } from '@/shared/hooks/common/useFormatting';

export type FormatType = 'currency' | 'date' | 'datetime' | 'phone' | 'cpf' | 'cnpj' | 'percentage' | 'number' | 'numberCompact';

export interface FormatDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Valor a ser formatado */
  value: string | number | Date | null | undefined;
  /** Tipo de formatação */
  type: FormatType;
  /** Opções específicas de formatação */
  formatOptions?: FormattingOptions;
  /** Variação visual */
  variant?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'inherit';
  /** Tamanho do texto */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  /** Exibir tooltip com valor original */
  showTooltip?: boolean;
  /** Texto do tooltip customizado */
  tooltipText?: string;
  /** Prefixo para exibir antes do valor */
  prefix?: string;
  /** Sufixo para exibir após o valor */
  suffix?: string;
  /** Placeholder quando valor está vazio */
  placeholder?: string;
  /** Se deve truncar texto longo */
  truncate?: boolean;
}

export const FormatDisplay: React.FC<FormatDisplayProps> = ({
  value,
  type,
  formatOptions,
  variant = 'default',
  size = 'base',
  showTooltip = false,
  tooltipText,
  prefix,
  suffix,
  placeholder = '—',
  truncate = false,
  className,
  ...props
}) => {
  const formatters = useFormatting(formatOptions);

  // Função para formatar o valor baseado no tipo
  const formatValue = (val: string | number | Date | null | undefined): string => {
    // ✅ Verificação expandida para valores inválidos
    if (val === null || val === undefined || val === '') {
      return placeholder;
    }

    // ✅ Verificação específica para NaN e valores inválidos numéricos
    if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
      console.warn(`FormatDisplay: Valor numérico inválido detectado (${val}) para tipo ${type}, usando placeholder`);
      return placeholder;
    }

    // ✅ Verificação para strings que representam NaN
    if (typeof val === 'string' && (val.toLowerCase() === 'nan' || val === 'NaN')) {
      console.warn(`FormatDisplay: String NaN detectada (${val}) para tipo ${type}, usando placeholder`);
      return placeholder;
    }

    try {
      switch (type) {
        case 'currency': {
          const numVal = Number(val);
          // ✅ Dupla verificação para currency
          if (isNaN(numVal) || !isFinite(numVal)) {
            return placeholder;
          }
          return formatters.currency(numVal);
        }
        case 'date':
          return formatters.date(val);
        case 'datetime':
          return formatters.datetime(val);
        case 'phone':
          return formatters.phone(String(val));
        case 'cpf':
          return formatters.cpf(String(val));
        case 'cnpj':
          return formatters.cnpj(String(val));
        case 'percentage': {
          const numVal = Number(val);
          // ✅ Dupla verificação para percentage
          if (isNaN(numVal) || !isFinite(numVal)) {
            return placeholder;
          }
          return formatters.percentage(numVal);
        }
        case 'number': {
          const numVal = Number(val);
          // ✅ Dupla verificação para number
          if (isNaN(numVal) || !isFinite(numVal)) {
            return placeholder;
          }
          return formatters.number(numVal);
        }
        case 'numberCompact': {
          const numVal = Number(val);
          // ✅ Dupla verificação para numberCompact
          if (isNaN(numVal) || !isFinite(numVal)) {
            return placeholder;
          }
          return formatters.numberCompact(numVal);
        }
        default:
          return String(val);
      }
    } catch (error) {
      console.warn(`FormatDisplay: Erro ao formatar valor ${val} com tipo ${type}:`, error);
      return placeholder; // ✅ Retorna placeholder em vez de valor bruto em caso de erro
    }
  };

  // Classes CSS baseadas na variação
  const getVariantClasses = () => {
    switch (variant) {
      case 'muted':
        return 'text-gray-500 dark:text-gray-400';
      case 'primary':
        return 'text-primary-yellow font-medium';
      case 'success':
        return 'text-green-600 dark:text-green-400 font-medium';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 font-medium';
      case 'danger':
        return 'text-red-600 dark:text-red-400 font-medium';
      case 'inherit':
        return ''; // Não aplica nenhuma cor, deixa herdar do pai
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  // Classes CSS baseadas no tamanho
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      default:
        return 'text-base';
    }
  };

  const formattedValue = formatValue(value);
  const displayValue = `${prefix || ''}${formattedValue}${suffix || ''}`;
  const title = showTooltip 
    ? tooltipText || `Valor original: ${value}`
    : undefined;

  return (
    <span
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        truncate && 'truncate',
        'inline-block',
        className
      )}
      title={title}
      {...props}
    >
      {displayValue}
    </span>
  );
};

// Componentes específicos para facilitar o uso
export const CurrencyDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="currency" />
);

export const DateDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="date" />
);

export const DateTimeDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="datetime" />
);

export const PhoneDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="phone" />
);

export const CpfDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="cpf" />
);

export const CnpjDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="cnpj" />
);

export const PercentageDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="percentage" />
);

export const NumberDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="number" />
);

export const NumberCompactDisplay: React.FC<Omit<FormatDisplayProps, 'type'>> = (props) => (
  <FormatDisplay {...props} type="numberCompact" />
);