import React from 'react';
import { cn } from '@/core/config/utils';

interface PlaceholderBadgeProps {
  text?: string;
  className?: string;
}

export function PlaceholderBadge({ text = 'PLACEHOLDER / MOCK', className }: PlaceholderBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'pointer-events-none select-none absolute top-2 right-2 z-20',
        'px-2 py-0.5 rounded-full text-[10px] font-medium',
        'bg-red-500/15 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm',
        className,
      )}
      aria-hidden="true"
    >
      {text}
    </div>
  );
}

