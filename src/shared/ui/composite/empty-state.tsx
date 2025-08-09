import { LucideIcon, Users, Package, Search, FileX } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { cn, getEmptyStateClasses } from '@/core/config/theme-utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'flex items-center justify-center h-32',
    content: 'text-center',
    spacing: 'py-0',
  },
  compact: {
    container: 'flex items-center justify-center h-24',
    content: 'text-center',
    spacing: 'py-0',
  },
  detailed: {
    container: 'flex flex-col items-center justify-center py-12',
    content: 'text-center',
    spacing: 'py-4',
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className
}) => {
  const styles = variantStyles[variant];
  const emptyStateStyles = getEmptyStateClasses();

  return (
    <div className={cn(emptyStateStyles.container, styles.container, className)}>
      <div className={styles.content}>
        <Icon className={emptyStateStyles.icon} />
        
        {title && (
          <h3 className={emptyStateStyles.title}>
            {title}
          </h3>
        )}
        
        <div className={cn(
          emptyStateStyles.description,
          !title && 'text-sm'
        )}>
          {description}
        </div>
        
        {action && (
          <div className="mt-4">
            <Button
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              size="sm"
              className={emptyStateStyles.action}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes pré-configurados para casos comuns
export const EmptyCustomers: React.FC<{
  hasFilters?: boolean;
  onCreateNew?: () => void;
}> = ({ hasFilters = false, onCreateNew }) => (
  <EmptyState
    icon={Users}
    description={
      hasFilters 
        ? 'Nenhum cliente encontrado com os filtros aplicados'
        : 'Nenhum cliente cadastrado'
    }
    action={onCreateNew ? {
      label: 'Novo Cliente',
      onClick: onCreateNew
    } : undefined}
  />
);

export const EmptyProducts: React.FC<{
  hasFilters?: boolean;
  onCreateNew?: () => void;
}> = ({ hasFilters = false, onCreateNew }) => (
  <EmptyState
    icon={Package}
    description={
      hasFilters
        ? 'Nenhum produto encontrado com os filtros aplicados'
        : 'Nenhum produto cadastrado'
    }
    action={onCreateNew ? {
      label: 'Novo Produto',
      onClick: onCreateNew
    } : undefined}
  />
);

export const EmptySearchResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title="Nenhum resultado encontrado"
    description={
      searchTerm 
        ? `Não foi possível encontrar resultados para "${searchTerm}"`
        : 'Tente ajustar os filtros ou termo de busca'
    }
    variant="detailed"
    action={onClearSearch ? {
      label: 'Limpar Busca',
      onClick: onClearSearch,
      variant: 'ghost'
    } : undefined}
  />
);

// Componente genérico para outros casos
export const EmptyData: React.FC<{
  entityName: string;
  hasFilters?: boolean;
  icon?: LucideIcon;
}> = ({ 
  entityName, 
  hasFilters = false, 
  icon = FileX 
}) => (
  <EmptyState
    icon={icon}
    description={
      hasFilters
        ? `Nenhum ${entityName.toLowerCase()} encontrado com os filtros aplicados`
        : `Nenhum ${entityName.toLowerCase()} cadastrado`
    }
  />
);