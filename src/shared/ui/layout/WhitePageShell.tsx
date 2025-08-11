import React from 'react';
import { cn } from '@/core/config/utils';

export interface WhitePageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'lg' | 'xl' | '2xl' | '3xl' | '7xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses: Record<NonNullable<WhitePageShellProps['maxWidth']>, string> = {
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  '3xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses: Record<NonNullable<WhitePageShellProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * WhitePageShell
 *
 * A white, rounded container with a subtle shadow and border that sits above
 * the animated black/white background and next to the transparent sidebar.
 * Keeps margins so the background remains visible around it.
 */
export function WhitePageShell({
  children,
  className,
  maxWidth = '7xl',
  padding = 'md',
}: WhitePageShellProps): JSX.Element {
  return (
    <div className="w-full">
      <div
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
        )}
      >
        <div
          className={cn(
            // White surface with subtle separation from dark bg
            'bg-white text-gray-900 rounded-2xl border border-black/5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]',
            // Ensure the edges and background are visible around container
            'min-h-[60vh]',
            paddingClasses[padding],
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default WhitePageShell;


