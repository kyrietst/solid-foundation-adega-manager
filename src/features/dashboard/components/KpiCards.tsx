import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/utils';
import { text, shadows } from '@/core/config/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

export interface KpiData {
  id: string;
  label: string;
  value: string | number;
  delta?: number; // variação percentual
  valueType?: 'positive' | 'negative' | 'neutral'; // tipo semântico do valor
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  isLoading?: boolean;
  subLabel?: string;
}

export interface KpiCardsProps {
  items: KpiData[];
  className?: string;
  showAnimation?: boolean;
  compact?: boolean;
}

// Cores semânticas para valores KPI (Fluidlamp Optimized)
const valueTypeColors = {
  positive: cn(text.h3, shadows.light), // Verde com sombra
  negative: 'text-red-400 font-semibold [text-shadow:_0_1px_2px_rgba(0,0,0,0.4)]', // Vermelho
  neutral: cn(text.h4, shadows.light), // Azul neutro com sombra
} as const;

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    // Format large numbers with K, M notation
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
  return value;
}

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <div className={cn("flex items-center gap-1", text.h6, shadows.subtle)}>
        <Minus className="h-3 w-3" />
        <span className="text-xs font-semibold">0%</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'flex items-center gap-1 text-xs font-semibold',
        delta > 0 
          ? cn(text.h3, shadows.light) // Verde para positivo
          : 'text-red-400 [text-shadow:_0_1px_2px_rgba(0,0,0,0.4)]' // Vermelho para negativo
      )}
    >
      {delta > 0 ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>{delta > 0 ? '+' : ''}{Math.abs(delta).toFixed(1)}%</span>
    </motion.div>
  );
}

function KpiCard({ kpi, index, showAnimation = true, compact = true }: { kpi: KpiData; index: number; showAnimation?: boolean; compact?: boolean }) {
  const cardContent = (
    <motion.div
      initial={showAnimation ? { y: 20, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        delay: showAnimation ? index * 0.1 : 0,
        duration: 0.4,
        ease: "easeOut"
      }}
    >
      <Card 
        className={cn(
          "relative border-white/20 bg-black/70 backdrop-blur-xl transition-all duration-300 group overflow-hidden shadow-lg h-[120px] flex flex-col",
          "hover:border-white/40 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 hover:bg-black/80",
          kpi.href && "cursor-pointer",
          kpi.isLoading && "animate-pulse"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-sm font-semibold", text.secondary, shadows.subtle)}>{kpi.label}</CardTitle>
            <div className="flex items-center gap-2">
              {kpi.icon && (
                <kpi.icon className="h-4 w-4 text-gray-300" />
              )}
              {kpi.href && (
                <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
          {kpi.subLabel && (
            <div className={cn("text-xs font-medium", text.h5, shadows.subtle)}>{kpi.subLabel}</div>
          )}
        </CardHeader>

        <CardContent className="pt-0 relative flex-1 flex flex-col justify-center">
          {kpi.isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-white/15 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <div>
              <motion.div 
                initial={showAnimation ? { scale: 0.8 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: showAnimation ? index * 0.1 + 0.1 : 0 }}
                className={cn(
                  'text-3xl font-extrabold tracking-tight',
                  kpi.valueType ? valueTypeColors[kpi.valueType] : 'text-white'
                )}
              >
                {formatValue(kpi.value)}
              </motion.div>
              
              <AnimatePresence>
                {typeof kpi.delta === 'number' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2"
                  >
                    <DeltaIndicator delta={kpi.delta} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 via-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );

  return kpi.href ? (
    <a href={kpi.href} className="block">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
}

export function KpiCards({ items, className, showAnimation = true }: KpiCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {items.map((kpi, index) => (
        <KpiCard 
          key={kpi.id} 
          kpi={kpi} 
          index={index} 
          showAnimation={showAnimation}
        />
      ))}
    </div>
  );
}

