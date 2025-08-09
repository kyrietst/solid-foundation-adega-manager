import React, { useState, useCallback } from 'react';
import { cn } from '@/core/config/utils';

export interface MagicBentoProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * MagicBento – grid container similar to a bento layout with auto rows for natural masonry.
 */
export function MagicBento({ className, children }: MagicBentoProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-[160px] gap-4', className)}>
      {children}
    </div>
  );
}

export interface MagicBentoItemProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * MagicBentoItem – glassy dark tile with animated radial glow that follows the cursor.
 */
export function MagicBentoItem({ className, children }: MagicBentoItemProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const spotlight = `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.08), transparent 60%)`;

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: -1000, y: -1000 })}
      className={cn(
        'relative min-h-[160px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden',
        'transition-all duration-300 hover:border-primary-yellow/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]',
        className
      )}
      style={{ backgroundImage: spotlight }}
    >
      {/* Subtle inner gradient border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

