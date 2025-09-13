import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LucideIcon } from 'lucide-react';
import { cn, getValueClasses, getGlassCardClasses, getIconClasses, getKPITextClasses } from '@/core/config/theme-utils';
import { FormatDisplay } from './FormatDisplay';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  emoji?: string; // Novo: suporte para emoji no padrão CRM
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'premium';
  className?: string;
  layout?: 'default' | 'crm'; // Novo: layout CRM ou padrão tradicional
  onClick?: () => void; // Novo: suporte para clique/navegação
  formatType?: 'currency' | 'number' | 'percentage' | 'none'; // Novo: tipo de formatação
}

const variantStyles = {
  default: {
    card: getGlassCardClasses('default'),
    title: 'text-gray-300',
    value: 'text-gray-100',
    description: 'text-gray-400',
    icon: 'secondary' as const
  },
  success: {
    card: cn(getGlassCardClasses('default'), 'hover:border-accent-green/60'),
    title: 'text-gray-300',
    value: 'text-accent-green',
    description: 'text-gray-400',
    icon: 'success' as const
  },
  warning: {
    card: cn(getGlassCardClasses('default'), 'hover:border-primary-yellow/60'),
    title: 'text-gray-300',
    value: 'text-primary-yellow',
    description: 'text-gray-400',
    icon: 'warning' as const
  },
  error: {
    card: cn(getGlassCardClasses('default'), 'hover:border-accent-red/60'),
    title: 'text-gray-300',
    value: 'text-accent-red',
    description: 'text-gray-400',
    icon: 'error' as const
  },
  purple: {
    card: cn(getGlassCardClasses('default'), 'hover:border-accent-purple/60'),
    title: 'text-gray-300',
    value: 'text-accent-purple',
    description: 'text-gray-400',
    icon: 'primary' as const
  },
  premium: {
    card: cn(getGlassCardClasses('premium'), 'hover:border-primary-yellow/60'),
    title: 'text-gray-300',
    value: 'text-primary-yellow',
    description: 'text-gray-400',
    icon: 'primary' as const
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
  const styles = variantStyles[variant];

  // Layout CRM: ícone + título + valor + descrição (padrão exato do CRM Dashboard)
  if (layout === 'crm') {
    return (
      <Card 
        className={cn(
          styles.card, 
          'h-[120px] hover:transform hover:-translate-y-1 transition-all duration-200',
          onClick && 'cursor-pointer select-none',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-6 h-full flex items-center">
          <div className="flex items-center gap-3 w-full">
            {/* Ícone Lucide (não emoji) */}
            {Icon && <Icon className={getIconClasses('lg', styles.icon)} />}
            
            <div className="flex-1">
              {/* Título */}
              <p className={cn(getKPITextClasses('title'), styles.title)}>
                {title}
              </p>
              
              {/* Valor Principal */}
              <div className={cn(getKPITextClasses('value'), 'mt-1', styles.value)}>
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
                <div className={cn(getKPITextClasses('subtitle'), 'mt-1 flex items-center', styles.description)}>
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
    <Card className={cn(styles.card, 'hover:transform hover:-translate-y-1 transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(getKPITextClasses('title'), styles.title)}>
          {title}
        </CardTitle>
        {Icon && <Icon className={getIconClasses('md', styles.icon)} />}
      </CardHeader>
      <CardContent>
        <div className={cn(getKPITextClasses('value'), styles.value)}>
          {formatType === 'none' ? value : (
            <FormatDisplay
              value={value}
              type={formatType}
              variant="inherit"
            />
          )}
        </div>
        {description && (
          <p className={cn(getKPITextClasses('subtitle'), 'mt-1', styles.description)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};