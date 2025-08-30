/**
 * Componentes para indicação visual do status de rede
 * Mostra conectividade, qualidade e operações em fila
 */

import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Monitor, 
  Signal,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Progress } from '@/shared/ui/primitives/progress';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { cn } from '@/core/config/utils';
import { useNetworkStatusSimple } from '@/shared/hooks/useNetworkStatusSimple';

interface NetworkIndicatorProps {
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  className,
  showDetails = false,
  size = 'md'
}) => {
  const networkStatus = useNetworkStatusSimple();

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className={cn(
        'text-red-500',
        size === 'sm' && 'w-3 h-3',
        size === 'md' && 'w-4 h-4',
        size === 'lg' && 'w-5 h-5'
      )} />;
    }

    // Usar ícone de WiFi para conexões online
    const color = networkStatus.isSlowConnection ? 'text-yellow-500' : 'text-green-500';
    return <Wifi className={cn(
      color,
      size === 'sm' && 'w-3 h-3',
      size === 'md' && 'w-4 h-4',
      size === 'lg' && 'w-5 h-5'
    )} />;
  };

  const getQualityColor = () => {
    if (!networkStatus.isOnline) return 'text-red-600';
    return networkStatus.isSlowConnection ? 'text-yellow-600' : 'text-green-600';
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    if (networkStatus.isSlowConnection) return 'Conexão Lenta';
    return 'Online';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {getConnectionIcon()}
      
      {showDetails && (
        <div className="flex items-center space-x-2">
          <span className={cn(
            'text-sm',
            networkStatus.isOnline ? 'text-green-600' : 'text-red-600'
          )}>
            {getStatusText()}
          </span>
          
          {networkStatus.isOnline && (
            <Badge variant="outline" className={networkStatus.isSlowConnection ? 'text-yellow-600' : 'text-green-600'}>
              {networkStatus.isSlowConnection ? 'Lenta' : 'Normal'}
            </Badge>
          )}
          
          {/* Queue size not available in simplified hook */}
        </div>
      )}
    </div>
  );
};

interface NetworkStatusCardProps {
  className?: string;
  onForceSync?: () => void;
  onClearQueue?: () => void;
}

export const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({
  className,
  onForceSync,
  onClearQueue
}) => {
  const networkStatus = useNetworkStatusSimple();

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NetworkIndicator size="lg" />
            <div>
              <CardTitle className="text-lg">Status da Rede</CardTitle>
              <CardDescription>
                {networkStatus.isOnline ? 'Conectado' : 'Desconectado'}
              </CardDescription>
            </div>
          </div>
          
          {/* Loader removed - isProcessingQueue not available in simple hook */}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Online/Offline */}
        {networkStatus.isOnline ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Conectado à internet</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-red-600">
            <WifiOff className="w-4 h-4" />
            <span>Sem conexão com a internet</span>
          </div>
        )}

        {/* Detalhes da Conexão (Simplificado) */}
        {networkStatus.isOnline && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 text-green-600">Conectado</span>
            </div>
            <div>
              <span className="font-medium">Velocidade:</span>
              <span className={cn('ml-2', networkStatus.isSlowConnection ? 'text-yellow-600' : 'text-green-600')}>
                {networkStatus.isSlowConnection ? 'Lenta' : 'Normal'}
              </span>
            </div>
          </div>
        )}

        {/* Hook Simplificado - Funcionalidades avançadas removidas */}
        {!networkStatus.isOnline && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Sistema offline - algumas funcionalidades podem estar limitadas
            </AlertDescription>
          </Alert>
        )}

        {/* Informações do Hook */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Status: Hook de rede simplificado ativo
        </div>
      </CardContent>
    </Card>
  );

};

// Componente compacto para barra de status
interface NetworkStatusBarProps {
  className?: string;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ className }) => {
  const networkStatus = useNetworkStatusSimple();

  if (networkStatus.isOnline) {
    return null; // Não mostrar nada quando está online (hook simplificado sem queue)
  }

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-sm text-center',
      className
    )}>
      <div className="flex items-center justify-center space-x-2">
        <NetworkIndicator size="sm" />
        <span>Você está offline</span>
      </div>
    </div>
  );
};