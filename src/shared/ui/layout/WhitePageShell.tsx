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
 * WhitePageShell (agora com Glassmorphism)
 *
 * Container com efeito glassmorphism que segue o padrão estabelecido no sistema.
 * Fundo translúcido preto com blur, bordas elegantes e hover effects interativos.
 * Mantém margens para que o background permaneça visível ao redor.
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
            // Glassmorphism pattern - padrão estabelecido no sistema
            'bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg text-white hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300',
            // Ensure the edges and background are visible around container
            'min-h-content-md',
            paddingClasses[padding],
            className,
          )}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
            (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default WhitePageShell;


