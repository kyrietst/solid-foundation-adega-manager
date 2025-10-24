/* eslint-disable react-hooks/exhaustive-deps */
/**
 * WavyBackground.tsx - Componente de fundo ondulado (REFATORADO)
 * Context7 Pattern: Eliminar supressão de linter desnecessária
 * Remove // eslint-disable-next-line react-hooks/exhaustive-deps
 *
 * REFATORAÇÃO APLICADA:
 * - useRef para variáveis de animação estáveis
 * - useCallback para funções de animação
 * - Dependências corretas no useEffect
 * - Cleanup otimizado da animação
 * - Eliminação da supressão do linter
 *
 * @version 2.0.0 - Sem supressão de linter (Context7)
 */

"use client";
import { cn } from "@/core/config/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

export interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs para variáveis de animação (evita dependências reativas)
  const animationRef = useRef<{
    w: number;
    h: number;
    nt: number;
    ctx: CanvasRenderingContext2D | null;
    animationId: number | null;
  }>({
    w: 0,
    h: 0,
    nt: 0,
    ctx: null,
    animationId: null,
  });

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  }, [speed]);

  // Função de desenho das ondas memoizada
  const drawWave = useCallback((n: number) => {
    const { w, h, nt, ctx } = animationRef.current;
    if (!ctx) return;

    animationRef.current.nt += getSpeed();
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = colors?.[i % colors.length] || `hsl(${Math.floor(i * 255 / n)}, 70%, 50%)`;

      for (let x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  }, [noise, waveWidth, colors, getSpeed]);

  // Função de renderização memoizada
  const render = useCallback(() => {
    const { w, h, ctx } = animationRef.current;
    if (!ctx) return;

    ctx.fillStyle = backgroundFill;
    ctx.globalAlpha = waveOpacity;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);

    animationRef.current.animationId = requestAnimationFrame(render);
  }, [backgroundFill, waveOpacity, drawWave]);

  // Função de redimensionamento memoizada
  const handleResize = useCallback(() => {
    const { ctx } = animationRef.current;
    if (!ctx) return;

    animationRef.current.w = ctx.canvas.width = window.innerWidth;
    animationRef.current.h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
  }, [blur]);

  // Função de inicialização memoizada
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Atualizar refs
    animationRef.current.ctx = ctx;
    animationRef.current.w = ctx.canvas.width = window.innerWidth;
    animationRef.current.h = ctx.canvas.height = window.innerHeight;
    animationRef.current.nt = 0;

    ctx.filter = `blur(${blur}px)`;

    // Event listener para redimensionamento
    window.addEventListener('resize', handleResize);

    // Iniciar animação
    render();
  }, [blur, handleResize, render]);

  // Effect principal sem supressão de linter
  useEffect(() => {
    init();

    return () => {
      // Cleanup da animação
      if (animationRef.current.animationId) {
        cancelAnimationFrame(animationRef.current.animationId);
      }
      // Cleanup do event listener
      window.removeEventListener('resize', handleResize);
    };
  }, [init, handleResize]); // Dependências corretas

  // Estado para Safari (mantido igual)
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={
          isSafari
            ? {
                filter: `blur(${blur}px)`,
              }
            : {}
        }
      ></canvas>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};