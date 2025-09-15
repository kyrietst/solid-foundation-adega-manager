/**
 * Generic EntityCard Component
 * Unified card pattern for products, customers, suppliers and other entities
 * Built with Context7 TypeScript patterns for maximum reusability and type safety
 *
 * Based on existing patterns from:
 * - ProductCard: Visual styling, glass effects, interaction patterns
 * - CustomerCard: Information layout, badge system
 * - SupplierCard: Action buttons, status management
 */

import React, { ReactNode, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { LucideIcon } from 'lucide-react';

// Context7 Pattern: Generic interfaces with intersection types for reusability
interface BaseEntityProps {
  id: string;
  name: string;
  className?: string;
}

// Context7 Pattern: Reusable intersection types for props
type EntityVariant = 'default' | 'premium' | 'success' | 'warning' | 'error';
type EntitySize = 'sm' | 'md' | 'lg';

interface EntityCardAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive';
  disabled?: boolean;
  className?: string;
}

interface EntityCardBadge {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: LucideIcon;
  className?: string;
}

interface EntityCardField {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

// Context7 Pattern: Generic component props with extends unknown for TSX compatibility
interface EntityCardProps<T extends BaseEntityProps> {
  entity: T;
  variant?: EntityVariant;
  size?: EntitySize;
  glassEffect?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  subtitle?: ReactNode;
  badges?: EntityCardBadge[];
  fields?: EntityCardField[];
  actions?: EntityCardAction[];
  primaryAction?: EntityCardAction;
  headerIcon?: LucideIcon;
  children?: ReactNode;
  onSelect?: (entity: T) => void;
  customMemoComparison?: (prevProps: EntityCardProps<T>, nextProps: EntityCardProps<T>) => boolean;
}

// Context7 Pattern: Generic arrow function component with <T extends unknown>
const EntityCard = <T extends BaseEntityProps>({
  entity,
  variant = 'default',
  size = 'md',
  glassEffect = true,
  imageUrl,
  imageAlt,
  subtitle,
  badges = [],
  fields = [],
  actions = [],
  primaryAction,
  headerIcon: HeaderIcon,
  children,
  onSelect,
  customMemoComparison,
}: EntityCardProps<T>) => {
  // Memoize computed values for performance (Context7 best practice)
  const glassClasses = useMemo(() =>
    glassEffect ? getGlassCardClasses(variant) : '',
    [glassEffect, variant]
  );

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'h-[280px]';
      case 'lg': return 'h-[420px]';
      default: return 'h-[350px]';
    }
  }, [size]);

  const handleCardClick = useMemo(() => {
    if (onSelect) {
      return () => onSelect(entity);
    }
    return undefined;
  }, [onSelect, entity]);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 flex flex-col',
        'hover:shadow-lg hover:shadow-purple-500/10',
        'bg-black/70 backdrop-blur-xl border border-purple-500/30',
        getHoverTransformClasses('lift'),
        sizeClasses,
        glassClasses,
        onSelect && 'cursor-pointer hover:border-primary-yellow/60',
        entity.className
      )}
      onClick={handleCardClick}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(entity);
        }
      } : undefined}
      aria-label={onSelect ? `Selecionar ${entity.name}` : undefined}
    >
      {/* Header Section */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Header Icon or Image */}
            {HeaderIcon && (
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30 flex-shrink-0 backdrop-blur-sm">
                <HeaderIcon className="h-5 w-5 text-purple-400" />
              </div>
            )}
            {imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <img
                  src={imageUrl}
                  alt={imageAlt || entity.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            )}

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg truncate" title={entity.name}>
                {entity.name}
              </h3>
              {subtitle && (
                <div className="mt-1 text-sm text-gray-300">
                  {subtitle}
                </div>
              )}

              {/* Header Badges */}
              {badges.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant={badge.variant || 'outline'}
                      className={cn(
                        'text-xs backdrop-blur-sm',
                        badge.className
                      )}
                    >
                      {badge.icon && React.createElement(badge.icon, { className: "h-3 w-3 mr-1" })}
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Header Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  disabled={action.disabled}
                  className={cn(
                    "h-8 w-8 p-0 hover:bg-purple-500/20 border border-transparent hover:border-purple-400/30 backdrop-blur-sm transition-all duration-200",
                    action.className
                  )}
                  title={action.label}
                  aria-label={action.label}
                >
                  <action.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden">
        {/* Dynamic Fields */}
        {fields.length > 0 && (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  {field.icon && React.createElement(field.icon, { className: "h-3 w-3" })}
                  <span>{field.label}:</span>
                </div>
                <div className={cn("text-white truncate flex-1 text-right", field.className)}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Content */}
        {children && (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        )}

        {/* Spacer to push primary action to bottom */}
        <div className="flex-1"></div>

        {/* Primary Action Button */}
        {primaryAction && (
          <div className="flex-shrink-0 pt-2 border-t border-white/10">
            <Button
              variant={primaryAction.variant || 'default'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              disabled={primaryAction.disabled}
              className={cn(
                "w-full transition-all duration-200",
                getHoverTransformClasses('scale'),
                primaryAction.className
              )}
              aria-label={primaryAction.label}
            >
              <primaryAction.icon className="h-4 w-4 mr-2" />
              {primaryAction.label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Context7 Pattern: React.memo with custom comparison function support
export const MemoizedEntityCard = React.memo(EntityCard, (prevProps, nextProps) => {
  // Use custom comparison if provided
  if (prevProps.customMemoComparison) {
    return prevProps.customMemoComparison(prevProps, nextProps);
  }

  // Default comparison for common entity properties
  return (
    prevProps.entity.id === nextProps.entity.id &&
    prevProps.entity.name === nextProps.entity.name &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.glassEffect === nextProps.glassEffect &&
    prevProps.badges?.length === nextProps.badges?.length &&
    prevProps.fields?.length === nextProps.fields?.length &&
    prevProps.actions?.length === nextProps.actions?.length
  );
}) as typeof EntityCard;

// Export both versions for flexibility
export { EntityCard, MemoizedEntityCard as default };

// Context7 Pattern: Export utility types for consumers
export type {
  EntityCardProps,
  EntityCardAction,
  EntityCardBadge,
  EntityCardField,
  EntityVariant,
  EntitySize,
  BaseEntityProps
};