/**
 * Componente de Completude de Perfil
 * Indicador visual para qualidade e completude dos dados do cliente
 */

import React from 'react';
import { Progress } from '@/shared/ui/primitives/progress';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/shared/ui/primitives/tooltip';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BarChart3,
  Heart,
  Star
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { 
  CompletenessResult,
  FieldInfo,
  calculateCompleteness,
  generatePersonalizedSuggestions
} from '@/features/customers/utils/completeness-calculator';
import type { CustomerData } from '@/features/customers/utils/completeness-calculator';

// Mapeamento de ícones
const ICON_MAP = {
  Mail,
  Phone,
  Calendar,
  MapPin,
  BarChart3,
  Heart,
  Star
};

interface ProfileCompletenessProps {
  customer: CustomerData;
  variant?: 'default' | 'compact' | 'detailed';
  showRecommendations?: boolean;
  onFieldClick?: (field: FieldInfo) => void;
  className?: string;
}

const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
  customer,
  variant = 'default',
  showRecommendations = true,
  onFieldClick,
  className
}) => {
  const result = calculateCompleteness(customer);
  const suggestions = generatePersonalizedSuggestions(customer);

  // Cores baseadas na completude - Sistema Adega Wine Cellar v2.1
  const getCompletenessColor = () => {
    switch (result.level) {
      case 'excellent': return 'text-primary-yellow drop-shadow-sm';
      case 'good': return 'text-green-400 drop-shadow-sm';
      case 'fair': return 'text-accent-orange drop-shadow-sm';
      case 'poor': return 'text-accent-red drop-shadow-sm';
      default: return 'text-gray-400';
    }
  };

  const getProgressColor = () => {
    switch (result.level) {
      case 'excellent': return 'bg-gradient-to-r from-primary-yellow via-yellow-400 to-primary-yellow animate-pulse';
      case 'good': return 'bg-gradient-to-r from-green-500 via-green-400 to-green-500';
      case 'fair': return 'bg-gradient-to-r from-accent-orange via-yellow-400 to-accent-orange';
      case 'poor': return 'bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-pulse';
      default: return 'bg-gray-600';
    }
  };

  const getGlowEffect = () => {
    switch (result.level) {
      case 'excellent': return 'shadow-lg shadow-primary-yellow/20';
      case 'good': return 'shadow-lg shadow-green-400/20';
      case 'fair': return 'shadow-lg shadow-accent-orange/20';
      case 'poor': return 'shadow-lg shadow-accent-red/20';
      default: return '';
    }
  };

  const getBadgeVariant = () => {
    switch (result.level) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  // Renderizar ícone do campo
  const renderFieldIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Target className="h-4 w-4" />;
  };

  // Versão compacta - apenas barra de progresso
  if (variant === 'compact') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2 cursor-pointer", className)}>
              <div className="flex-1 relative">
                <Progress 
                  value={result.percentage} 
                  className="h-3 bg-black/60 border border-white/10 backdrop-blur-sm"
                />
                <div 
                  className={cn(
                    "absolute inset-0 h-3 rounded-full transition-all duration-500", 
                    getProgressColor(),
                    getGlowEffect()
                  )}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <span className={cn("text-xs font-bold", getCompletenessColor())}>
                {result.percentage}%
              </span>
              {result.level === 'poor' && (
                <AlertTriangle className="h-3 w-3 text-accent-red animate-pulse" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent 
              side="top" 
              className="max-w-sm z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl shadow-primary-yellow/10" 
              sideOffset={8}
              avoidCollisions={true}
              collisionPadding={10}
            >
            <div className="space-y-3 p-1">
              {/* Header com status */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-white">Completude do Perfil</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-bold text-sm", getCompletenessColor())}>
                    {result.percentage}%
                  </span>
                  {result.level === 'excellent' && <CheckCircle2 className="h-4 w-4 text-primary-yellow" />}
                  {result.level === 'poor' && <AlertTriangle className="h-4 w-4 text-accent-red animate-pulse" />}
                </div>
              </div>
              
              {/* Campos críticos para relatórios */}
              {result.criticalMissing.length > 0 && (
                <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-2">
                  <p className="text-accent-red font-medium text-xs flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    {result.criticalMissing.length} campos críticos para relatórios
                  </p>
                  <div className="text-xs text-red-200 space-y-1">
                    {result.criticalMissing.slice(0, 3).map((field, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-accent-red rounded-full"></span>
                        <span>{field.label}</span>
                      </div>
                    ))}
                    {result.criticalMissing.length > 3 && (
                      <p className="text-accent-red/70 italic">+{result.criticalMissing.length - 3} outros campos</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Recomendação prioritária */}
              {result.recommendations.length > 0 && (
                <div className="bg-primary-yellow/10 border border-primary-yellow/20 rounded-lg p-2">
                  <p className="text-primary-yellow font-medium text-xs flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    Recomendação Prioritária
                  </p>
                  <p className="text-yellow-100 text-xs">
                    {result.recommendations[0]}
                  </p>
                </div>
              )}
              
              {/* Status geral */}
              <div className="text-center pt-1 border-t border-white/10">
                <p className="text-xs text-gray-300">
                  {result.presentFields.length} de {result.presentFields.length + result.missingFields.length} campos • 
                  <span className="text-primary-yellow ml-1 font-medium">Clique para ver detalhes</span>
                </p>
              </div>
            </div>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Versão padrão
  return (
    <div className={cn("space-y-4 p-4 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10", className)}>
      {/* Cabeçalho com progresso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", result.level === 'excellent' ? 'bg-primary-yellow/20' : 'bg-gray-700/50')}>
            <TrendingUp className={cn("h-5 w-5", getCompletenessColor())} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Completude do Perfil</h3>
            <p className="text-sm text-gray-400">
              {result.presentFields.length} de {result.presentFields.length + result.missingFields.length} campos preenchidos
            </p>
          </div>
        </div>
        
        <Badge variant={getBadgeVariant()} className="shrink-0">
          {result.percentage}%
        </Badge>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={result.percentage} 
            className="h-3 bg-gray-700/50"
          />
          <div 
            className={cn("absolute inset-0 h-3 rounded-full transition-all", getProgressColor())}
            style={{ width: `${result.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Incompleto</span>
          <span>Completo</span>
        </div>
      </div>

      {/* Campos Ausentes (Versão Detalhada) */}
      {variant === 'detailed' && result.missingFields.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Campos Ausentes
          </h4>
          
          {/* Campos Críticos */}
          {result.criticalMissing.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-red-400 font-medium">🔴 CRÍTICOS</p>
              <div className="grid grid-cols-1 gap-1">
                {result.criticalMissing.map((field) => (
                  <Button
                    key={field.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => onFieldClick?.(field)}
                    className="justify-start h-auto p-2 text-left hover:bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center gap-2">
                      {renderFieldIcon(field.icon)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-400">{field.label}</p>
                        <p className="text-xs text-gray-400 truncate">{field.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Campos Importantes */}
          {result.importantMissing.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-yellow-400 font-medium">🟡 IMPORTANTES</p>
              <div className="grid grid-cols-1 gap-1">
                {result.importantMissing.map((field) => (
                  <Button
                    key={field.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => onFieldClick?.(field)}
                    className="justify-start h-auto p-2 text-left hover:bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="flex items-center gap-2">
                      {renderFieldIcon(field.icon)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-yellow-400">{field.label}</p>
                        <p className="text-xs text-gray-400 truncate">{field.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recomendações */}
      {showRecommendations && suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Recomendações
          </h4>
          <div className="space-y-1">
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <p key={index} className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                {suggestion}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          {result.level === 'excellent' && (
            <span className="text-xs text-primary-yellow">🏆 Perfil Excelente</span>
          )}
          {result.level === 'good' && (
            <span className="text-xs text-green-400">✅ Bom Perfil</span>
          )}
          {result.level === 'fair' && (
            <span className="text-xs text-yellow-400">⚠️ Perfil Razoável</span>
          )}
          {result.level === 'poor' && (
            <span className="text-xs text-red-400">❌ Perfil Incompleto</span>
          )}
        </div>
        
        <span className="text-xs text-gray-400">
          {result.score}/{result.maxScore} pontos
        </span>
      </div>
    </div>
  );
};

export default ProfileCompleteness;