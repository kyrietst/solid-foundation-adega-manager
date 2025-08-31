import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { cn } from '@/core/config/utils';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Package, ShoppingCart } from 'lucide-react';

export interface KpiData {
  id: string;
  label: string;
  value: string | number;
  delta?: number; // variação percentual
  valueType?: 'positive' | 'negative' | 'neutral'; // tipo semântico do valor
  icon?: React.ComponentType<{ className?: string }>; // ícone Lucide para padrão CRM
  href?: string;
  isLoading?: boolean;
  subLabel?: string;
}

export interface KpiCardsProps {
  items: KpiData[];
  className?: string;
  showAnimation?: boolean;
  compact?: boolean;
}

// Mapear variants com base no valueType
function getVariant(valueType?: KpiData['valueType']): 'default' | 'success' | 'warning' | 'error' | 'purple' | 'premium' {
  switch (valueType) {
    case 'positive': return 'success';
    case 'negative': return 'error';
    case 'neutral': return 'premium';
    default: return 'default';
  }
}

// Formatar descrição com delta
function formatDescription(delta?: number, subLabel?: string): string {
  let description = '';
  
  if (typeof delta === 'number') {
    const deltaText = delta > 0 ? `⬆ +${delta.toFixed(1)}%` : 
                     delta < 0 ? `⬇ ${delta.toFixed(1)}%` : 
                     '➖ 0%';
    description = deltaText;
    
    if (subLabel) {
      description += ` • ${subLabel}`;
    }
  } else if (subLabel) {
    description = subLabel;
  }
  
  return description;
}

export function KpiCards({ items, className, showAnimation = true }: KpiCardsProps) {
  const navigate = useNavigate();

  const handleKpiClick = (href?: string) => {
    if (href) {
      console.log('🔗 KpiCards - Navegando para:', href);
      navigate(href);
    }
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {items.map((kpi, index) => {
        return (
          <div key={kpi.id} className={kpi.href ? 'cursor-pointer' : ''}>
            <StatCard
              title={kpi.label}
              value={kpi.value}
              description={formatDescription(kpi.delta, kpi.subLabel)}
              icon={kpi.icon}
              variant={getVariant(kpi.valueType)}
              layout="crm"
              className={kpi.isLoading ? 'animate-pulse' : ''}
              onClick={kpi.href ? () => handleKpiClick(kpi.href) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

