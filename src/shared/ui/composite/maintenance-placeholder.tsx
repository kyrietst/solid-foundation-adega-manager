import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Progress } from '@/shared/ui/primitives/progress';
import { 
  Settings, 
  Wrench, 
  Clock, 
  Zap, 
  ExternalLink,
  Calendar,
  MapPin,
  MessageSquare,
  Bot,
  Rocket
} from 'lucide-react';
import { cn } from '@/core/config/utils';

interface MaintenancePlaceholderProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  variant?: 'default' | 'maps' | 'n8n' | 'whatsapp' | 'ai';
  expectedDate?: string;
  progress?: number;
  features?: string[];
  className?: string;
}

const variantConfig = {
  default: {
    icon: Settings,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    badgeColor: 'border-yellow-500/30 text-yellow-500'
  },
  maps: {
    icon: MapPin,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    badgeColor: 'border-green-500/30 text-green-500'
  },
  n8n: {
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeColor: 'border-purple-500/30 text-purple-500'
  },
  whatsapp: {
    icon: MessageSquare,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeColor: 'border-emerald-500/30 text-emerald-500'
  },
  ai: {
    icon: Bot,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeColor: 'border-blue-500/30 text-blue-500'
  }
};

export const MaintenancePlaceholder = ({
  title,
  description,
  icon: CustomIcon,
  variant = 'default',
  expectedDate,
  progress,
  features = [],
  className
}: MaintenancePlaceholderProps) => {
  const config = variantConfig[variant];
  const IconComponent = CustomIcon || config.icon;

  return (
    <Card className={cn(
      "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50",
      config.borderColor,
      className
    )}>
      <CardHeader>
        <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
          <IconComponent className={cn("h-4 w-4", config.color)} />
          {title}
          <Badge variant="outline" className={cn("ml-auto text-xs", config.badgeColor)}>
            🔧 Em Manutenção
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ícone principal animado */}
        <div className={cn("flex items-center justify-center py-6 rounded-lg", config.bgColor)}>
          <div className="relative">
            <IconComponent className={cn("h-16 w-16 animate-pulse", config.color)} />
            <div className="absolute -top-1 -right-1">
              <Settings className="h-6 w-6 text-yellow-400 animate-spin" style={{
                animationDuration: '3s'
              }} />
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          
          {expectedDate && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Previsão: {expectedDate}</span>
            </div>
          )}
        </div>

        {/* Barra de Progresso */}
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Preparação do Sistema</span>
              <span className={cn("font-medium", config.color)}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Lista de Features */}
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-300">Funcionalidades Previstas:</h4>
            <div className="space-y-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                  <Rocket className="h-3 w-3 text-gray-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2 border-t border-gray-700/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
            disabled
          >
            <Clock className="h-3 w-3 mr-2" />
            Aguardando Backend
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className={cn("border-gray-600 hover:border-gray-500", config.badgeColor)}
            disabled
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Detalhes
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Interface preparada • Aguardando integração
          </p>
        </div>
      </CardContent>
    </Card>
  );
};