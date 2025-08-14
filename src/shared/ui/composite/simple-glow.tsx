"use client";

import React, { useRef } from 'react';
import { cn } from '@/core/config/utils';

interface SimpleGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export const SimpleGlow: React.FC<SimpleGlowProps> = ({
  children,
  className,
  glowColor = '#FF4B01',
  intensity = 0.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    containerRef.current.style.setProperty('--glow-opacity', intensity.toString());
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty('--glow-opacity', '0');
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        '--glow-opacity': '0',
        '--glow-color': glowColor
      } as React.CSSProperties}
    >
      {/* Glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 40%)`,
          opacity: 'var(--glow-opacity)',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Border glow */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, var(--glow-color), transparent)`,
          opacity: 'calc(var(--glow-opacity) * 0.5)',
          filter: 'blur(1px)',
          zIndex: 1
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};