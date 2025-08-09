import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LucideIcon } from 'lucide-react';
import { cn, getValueClasses, getGlassCardClasses, getIconClasses } from '@/core/config/theme-utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'premium';
  className?: string;
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
    card: cn(getGlassCardClasses('default'), 'border-accent-green/30 bg-accent-green/5'),
    title: 'text-gray-300',
    value: 'text-accent-green',
    description: 'text-gray-400',
    icon: 'success' as const
  },
  warning: {
    card: cn(getGlassCardClasses('default'), 'border-primary-yellow/30 bg-primary-yellow/5'),
    title: 'text-gray-300',
    value: 'text-primary-yellow',
    description: 'text-gray-400',
    icon: 'warning' as const
  },
  error: {
    card: cn(getGlassCardClasses('default'), 'border-accent-red/30 bg-accent-red/5'),
    title: 'text-gray-300',
    value: 'text-accent-red',
    description: 'text-gray-400',
    icon: 'error' as const
  },
  purple: {
    card: cn(getGlassCardClasses('default'), 'border-accent-purple/30 bg-accent-purple/5'),
    title: 'text-gray-300',
    value: 'text-accent-purple',
    description: 'text-gray-400',
    icon: 'primary' as const
  },
  premium: {
    card: getGlassCardClasses('premium'),
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
  variant = 'default',
  className
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(styles.card, 'hover:transform hover:-translate-y-1 transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('text-sm font-medium', styles.title)}>
          {title}
        </CardTitle>
        {Icon && <Icon className={getIconClasses('md', styles.icon)} />}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', styles.value)}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        {description && (
          <p className={cn('text-xs mt-1', styles.description)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};