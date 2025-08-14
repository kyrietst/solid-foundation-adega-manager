/**
 * Header padronizado para Dashboard - Implementa o padrão visual definido
 * Baseado na documentação: /doc/JÁ_CONCLUIDOS/padronizacao_header_sales.md
 */

import React from 'react';
import { BlurIn } from "@/components/ui/blur-in";
import { cn } from '@/core/config/utils';

interface DashboardHeaderProps {
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  variant = 'premium',
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header - altura fixa */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Header Container */}
              <div className="relative w-full text-center sm:text-left bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                
                {/* Glow background sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF2400]/5 via-[#FFDA04]/10 to-[#FF2400]/5 rounded-xl blur-xl" />
                
                <div className="relative">
                  {/* Título animado */}
                  <BlurIn
                    word="PAINEL EXECUTIVO"
                    duration={1.2}
                    variant={{
                      hidden: { filter: "blur(15px)", opacity: 0 },
                      visible: { filter: "blur(0px)", opacity: 1 }
                    }}
                    className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
                    }}
                  />
                  
                  {/* Sublinhado elegante - 4 camadas */}
                  <div className="w-full h-6 relative mt-2">
                    {/* Camada 1: Vermelho com blur */}
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                    
                    {/* Camada 2: Vermelho sólido */}
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                    
                    {/* Camada 3: Amarelo com blur (menor largura) */}
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                    
                    {/* Camada 4: Amarelo sólido (menor largura) */}
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                  </div>
                </div>
              </div>
              
              {/* Slot para elementos adicionais do Dashboard */}
              <div className="flex gap-2">
                {/* Indicador de tempo real (opcional) */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-300">TEMPO REAL</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};