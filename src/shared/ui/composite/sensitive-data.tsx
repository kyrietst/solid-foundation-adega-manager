/**
 * Componente para controlar acesso a dados sensíveis
 * Oculta informações baseado nas permissões do usuário
 */

import React from 'react';
import { usePermissions } from '@/shared/hooks/auth/usePermissions';
import { EyeOff } from 'lucide-react';

interface SensitiveDataProps {
  children: React.ReactNode;
  type: 'cost' | 'profit' | 'financial' | 'admin';
  fallback?: React.ReactNode;
  className?: string;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({
  children,
  type,
  fallback,
  className = ''
}) => {
  const permissions = usePermissions();

  const hasAccess = () => {
    switch (type) {
      case 'cost':
        return permissions.canViewCostPrices;
      case 'profit':
        return permissions.canViewProfitMargins;
      case 'financial':
        return permissions.canViewFinancialData;
      case 'admin':
        return permissions.canAccessAdmin;
      default:
        return false;
    }
  };

  if (!hasAccess()) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <EyeOff className="h-4 w-4" />
        {fallback || (
          <span className="text-sm italic">
            {type === 'cost' && 'Custo oculto'}
            {type === 'profit' && 'Margem oculta'}
            {type === 'financial' && 'Dados financeiros restritos'}
            {type === 'admin' && 'Acesso restrito'}
          </span>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Hook utilitário para formatação de valores sensíveis
export const useSensitiveValue = () => {
  const permissions = usePermissions();

  const formatCostPrice = (value: number) => {
    if (!permissions.canViewCostPrices) {
      return '***';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatProfitMargin = (value: number) => {
    if (!permissions.canViewProfitMargins) {
      return '***%';
    }
    return `${value.toFixed(1)}%`;
  };

  const formatFinancialValue = (value: number) => {
    if (!permissions.canViewFinancialData) {
      return '***';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return {
    formatCostPrice,
    formatProfitMargin,
    formatFinancialValue,
    canViewCosts: permissions.canViewCostPrices,
    canViewProfits: permissions.canViewProfitMargins,
    canViewFinancial: permissions.canViewFinancialData
  };
};