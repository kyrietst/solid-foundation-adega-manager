
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { FormatDisplay } from './FormatDisplay';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: React.ReactNode;
  icon?: LucideIcon;
  emoji?: string; // Novo: suporte para emoji no padrão CRM
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand' | 'destructive' | 'purple' | 'premium'; // aligned variants + legacy support
  className?: string;
  layout?: 'default' | 'crm'; // Novo: layout CRM ou padrão tradicional
  onClick?: () => void; // Novo: suporte para clique/navegação
  formatType?: 'currency' | 'number' | 'percentage' | 'none'; // Novo: tipo de formatação
}

const variantStyles = {
  default: {
    card: "bg-surface/50 border-white/5 hover:border-brand/20",
    title: "text-muted-foreground",
    value: "text-foreground",
    description: "text-muted-foreground/60",
    icon: "text-muted-foreground"
  },
  success: {
    card: "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30",
    title: "text-emerald-500/80",
    value: "text-emerald-400",
    description: "text-emerald-500/60",
    icon: "text-emerald-500"
  },
  warning: {
    card: "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30",
    title: "text-amber-500/80",
    value: "text-amber-400",
    description: "text-amber-500/60",
    icon: "text-amber-500"
  },
  error: {
    card: "bg-destructive/5 border-destructive/10 hover:border-destructive/30",
    title: "text-destructive/80",
    value: "text-destructive",
    description: "text-destructive/60",
    icon: "text-destructive"
  },
  destructive: {
    card: "bg-destructive/5 border-destructive/10 hover:border-destructive/30",
    title: "text-destructive/80",
    value: "text-destructive",
    description: "text-destructive/60",
    icon: "text-destructive"
  },
  brand: {
    card: "bg-brand/5 border-brand/10 hover:border-brand/30",
    title: "text-brand/80",
    value: "text-brand",
    description: "text-brand/60",
    icon: "text-brand"
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  emoji,
  variant = 'default',
  layout = 'default',
  className,
  onClick,
  formatType = 'number'
}) => {
  // Map legacy variants if needed, or stick to strict typing
  const safeVariant = variant === 'premium' || variant === 'purple' ? 'brand' : variant;
  const styles = variantStyles[safeVariant as keyof typeof variantStyles] || variantStyles.default;

  // Layout CRM: ícone + título + valor + descrição (padrão exato do CRM Dashboard)
  if (layout === 'crm') {
    return (
      <Card 
        className={cn(
          styles.card, 
          'h-[120px] hover:-translate-y-1 transition-all duration-200 backdrop-blur-sm',
          onClick && 'cursor-pointer select-none',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-6 h-full flex items-center">
          <div className="flex items-center gap-3 w-full">
            {/* Ícone Lucide (não emoji) */}
            {Icon && <Icon className={cn("h-8 w-8", styles.icon)} />}
            
            <div className="flex-1 min-w-0">
              {/* Título */}
              <p className={cn("text-xs font-medium uppercase tracking-wider truncate", styles.title)}>
                {title}
              </p>
              
              {/* Valor Principal */}
              <div className={cn("text-2xl font-bold tracking-tight mt-0.5 truncate", styles.value)}>
                {formatType === 'none' ? value : (
                  <FormatDisplay
                    value={value}
                    type={formatType}
                    variant="inherit"
                  />
                )}
              </div>
              
              {/* Descrição/Subtítulo */}
              {description && (
                <div className={cn("text-xs truncate mt-1 flex items-center", styles.description)}>
                  {description}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout padrão (mantém compatibilidade)
  return (
    <Card className={cn(styles.card, 'hover:-translate-y-1 transition-all duration-200 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium", styles.title)}>
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-4 w-4", styles.icon)} />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", styles.value)}>
          {formatType === 'none' ? value : (
            <FormatDisplay
              value={value}
              type={formatType}
              variant="inherit"
            />
          )}
        </div>
        {description && (
          <p className={cn("text-xs mt-1", styles.description)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};