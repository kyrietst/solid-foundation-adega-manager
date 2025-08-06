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
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

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
  const networkStatus = useNetworkStatus();

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className={cn(
        'text-red-500',
        size === 'sm' && 'w-3 h-3',
        size === 'md' && 'w-4 h-4',
        size === 'lg' && 'w-5 h-5'
      )} />;
    }

    switch (networkStatus.connectionType) {
      case 'cellular':
        return <Smartphone className={cn(
          'text-green-500',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )} />;
      case 'ethernet':
        return <Monitor className={cn(
          'text-green-500',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )} />;
      default:
        return <Wifi className={cn(
          'text-green-500',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )} />;
    }
  };

  const getQualityColor = () => {
    switch (networkStatus.connectionQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    if (networkStatus.isProcessingQueue) return 'Sincronizando...';
    if (networkStatus.queueSize > 0) return `${networkStatus.queueSize} em fila`;
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
            <Badge variant="outline" className={getQualityColor()}>
              {networkStatus.connectionQuality}
            </Badge>
          )}
          
          {networkStatus.queueSize > 0 && (
            <Badge variant="secondary">
              {networkStatus.queueSize}
            </Badge>
          )}
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
  const networkStatus = useNetworkStatus();

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
          
          {networkStatus.isProcessingQueue && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          )}
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

        {/* Detalhes da Conexão */}
        {networkStatus.isOnline && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Tipo:</span>
              <span className="ml-2 capitalize">{networkStatus.connectionType}</span>
            </div>
            <div>
              <span className="font-medium">Velocidade:</span>
              <span className="ml-2 capitalize">{networkStatus.effectiveType}</span>
            </div>
            <div>
              <span className="font-medium">Qualidade:</span>
              <span className={cn('ml-2 capitalize', getQualityColor())}>
                {networkStatus.connectionQuality}
              </span>
            </div>
            <div>
              <span className="font-medium">RTT:</span>
              <span className="ml-2">{networkStatus.rtt}ms</span>
            </div>
          </div>
        )}

        {/* Informações de Tempo Offline */}
        {!networkStatus.isOnline && networkStatus.offlineDuration > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Offline há {formatDuration(networkStatus.offlineDuration)}
            </AlertDescription>
          </Alert>
        )}

        {/* Queue de Operações */}
        {networkStatus.queueSize > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Operações em Fila</span>
              <Badge variant="secondary">{networkStatus.queueSize}</Badge>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {networkStatus.isProcessingQueue 
                ? 'Sincronizando operações...'
                : 'Aguardando conexão para sincronizar'
              }
            </div>

            {networkStatus.isProcessingQueue && (
              <Progress value={undefined} className="w-full" />
            )}

            <div className="flex space-x-2">
              {networkStatus.isOnline && !networkStatus.isProcessingQueue && (
                <Button size="sm" onClick={onForceSync}>
                  Sincronizar Agora
                </Button>
              )}
              
              <Button size="sm" variant="outline" onClick={onClearQueue}>
                Limpar Fila
              </Button>
            </div>
          </div>
        )}

        {/* Modo de Economia de Dados */}
        {networkStatus.saveData && (
          <Alert>
            <Signal className="h-4 w-4" />
            <AlertDescription>
              Modo de economia de dados ativo. Algumas funcionalidades podem estar limitadas.
            </AlertDescription>
          </Alert>
        )}

        {/* Última Conexão */}
        {networkStatus.lastOnlineTime && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Última conexão: {networkStatus.lastOnlineTime.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getQualityColor(): string {
    switch (networkStatus.connectionQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
};

// Componente compacto para barra de status
interface NetworkStatusBarProps {
  className?: string;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ className }) => {
  const networkStatus = useNetworkStatus();

  if (networkStatus.isOnline && networkStatus.queueSize === 0) {
    return null; // Não mostrar nada quando está tudo normal
  }

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-sm text-center',
      !networkStatus.isOnline && 'bg-red-500 text-white',
      networkStatus.isProcessingQueue && 'bg-blue-500 text-white',
      className
    )}>
      <div className="flex items-center justify-center space-x-2">
        <NetworkIndicator size="sm" />
        <span>
          {!networkStatus.isOnline && 'Você está offline'}
          {networkStatus.isOnline && networkStatus.isProcessingQueue && 'Sincronizando operações...'}
          {networkStatus.isOnline && !networkStatus.isProcessingQueue && networkStatus.queueSize > 0 && 
            `${networkStatus.queueSize} operação(ões) aguardando sincronização`
          }
        </span>
        
        {networkStatus.isOnline && networkStatus.queueSize > 0 && !networkStatus.isProcessingQueue && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs h-6 px-2"
            onClick={() => networkStatus.processQueue()}
          >
            Sincronizar
          </Button>
        )}
      </div>
    </div>
  );
};