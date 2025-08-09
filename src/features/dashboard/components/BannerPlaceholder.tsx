import React from 'react';
import { cn } from '@/core/config/utils';

interface BannerPlaceholderProps {
  message?: string;
  className?: string;
}

export function BannerPlaceholder({
  message = 'Alguns blocos exibem PLACEHOLDER / MOCK DATA até as RPCs reais serem disponibilizadas.',
  className,
}: BannerPlaceholderProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 text-xs',
        'backdrop-blur-sm shadow-sm',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="font-medium">PLACEHOLDER / MOCK DATA:</span>
      <span className="ml-2">{message}</span>
    </div>
  );
}

