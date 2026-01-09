import React from 'react';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { Plus } from 'lucide-react';

interface StandardPageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra elements to render before the primary action button (e.g. Refresh, Export) */
  children?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  children
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10 px-8 py-6">
      {/* Title Section */}
      <div>
        <BlurIn
          word={title}
          duration={1.2}
          variant={{
            hidden: { filter: "blur(15px)", opacity: 0 },
            visible: { filter: "blur(0px)", opacity: 1 }
          }}
          className={cn(
            "text-3xl font-bold tracking-tight",
            "text-primary drop-shadow-[0_0_12px_rgba(244,202,37,0.4)] mb-1"
          )}
        />
        <p className="text-base text-muted-foreground font-light mt-1">
          {subtitle}
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {children}

        {/* Primary Action */}
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            className="bg-adega-gold hover:bg-adega-gold/90 text-adega-charcoal font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
