/**
 * Header padronizado para Dashboard - Implementa o padrão visual definido
 * Baseado na documentação: /doc/JÁ_CONCLUIDOS/padronizacao_header_sales.md
 */

import React from 'react';
import { GradientText } from "@/components/ui/gradient-text";
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
      {/* Header - altura fixa, seguindo padrão da SalesPage */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Header */}
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Header Container */}
              <div className="relative w-full text-left px-4 lg:px-8">
                {/* Título animado */}
                <GradientText
                  colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
                  animationSpeed={6}
                  showBorder={false}
                  className="text-xl lg:text-2xl font-bold"
                >
                  DASHBOARD
                </GradientText>
                
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
          </div>
          
          
        </div>
      </div>
    </div>
  );
};