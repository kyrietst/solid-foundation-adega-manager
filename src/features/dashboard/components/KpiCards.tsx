import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

export interface KpiData {
  id: string;
  label: string;
  value: string | number;
  delta?: number; // variação percentual
  accent?: 'amber' | 'green' | 'red' | 'blue' | 'purple';
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  isLoading?: boolean;
  subLabel?: string;
}

export interface KpiCardsProps {
  items: KpiData[];
  className?: string;
  showAnimation?: boolean;
}

const accentMap = {
  amber: 'text-amber-400',
  green: 'text-emerald-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
} as const;

const accentBgMap = {
  amber: 'bg-amber-500/10 border-amber-500/30',
  green: 'bg-emerald-500/10 border-emerald-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  blue: 'bg-blue-500/10 border-blue-500/30',
  purple: 'bg-purple-500/10 border-purple-500/30',
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
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="h-3 w-3" />
        <span className="text-xs">0%</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'flex items-center gap-1 text-xs font-medium',
        delta > 0 ? 'text-emerald-400' : 'text-red-400'
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

function KpiCard({ kpi, index, showAnimation = true }: { kpi: KpiData; index: number; showAnimation?: boolean }) {
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
          "relative border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 group overflow-hidden",
          "hover:border-white/30 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1",
          kpi.accent && accentBgMap[kpi.accent],
          kpi.href && "cursor-pointer",
          kpi.isLoading && "animate-pulse"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-400 font-medium">{kpi.label}</CardTitle>
            <div className="flex items-center gap-2">
              {kpi.icon && (
                <kpi.icon className={cn("h-4 w-4", kpi.accent ? accentMap[kpi.accent] : "text-gray-400")} />
              )}
              {kpi.href && (
                <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
          {kpi.subLabel && (
            <div className="text-xs text-gray-500">{kpi.subLabel}</div>
          )}
        </CardHeader>

        <CardContent className="pt-0 relative">
          {kpi.isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <div>
              <motion.div 
                initial={showAnimation ? { scale: 0.8 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: showAnimation ? index * 0.1 + 0.1 : 0 }}
                className={cn(
                  'text-2xl font-bold text-white tracking-tight',
                  kpi.accent && accentMap[kpi.accent]
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

