/**
 * @fileoverview Modal para atribuição de entregadores
 * Permite atribuição manual ou automática com métricas de performance
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseModal } from '@/shared/ui/composite';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { 
  User, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Activity,
  Target
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

interface DeliveryPerson {
  delivery_person_id: string;
  delivery_person_name: string;
  delivery_person_email: string;
  active_deliveries: number;
  completed_today: number;
  avg_delivery_time_minutes: number;
  is_available: boolean;
}

interface DeliveryAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  currentDeliveryPersonId?: string;
  currentDeliveryPersonName?: string;
  onAssignmentComplete?: () => void;
}

export const DeliveryAssignmentModal = ({
  isOpen,
  onClose,
  saleId,
  currentDeliveryPersonId,
  currentDeliveryPersonName,
  onAssignmentComplete
}: DeliveryAssignmentModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Buscar entregadores disponíveis
  const { data: deliveryPersons = [], isLoading } = useQuery({
    queryKey: ['available-delivery-persons'],
    queryFn: async (): Promise<DeliveryPerson[]> => {
      console.log('🚚 Buscando entregadores disponíveis...');

      const { data, error } = await supabase.rpc('get_available_delivery_persons');

      if (error) {
        console.error('❌ Erro ao buscar entregadores:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} entregadores encontrados`);
      return data || [];
    },
    enabled: isOpen,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Mutation para atribuir entregador
  const assignDeliveryPerson = useMutation({
    mutationFn: async ({ deliveryPersonId, autoAssign }: { deliveryPersonId?: string; autoAssign?: boolean }) => {
      console.log(`🎯 Atribuindo entregador para venda ${saleId}...`);

      const { data, error } = await supabase.rpc('assign_delivery_person', {
        p_sale_id: saleId,
        p_delivery_person_id: deliveryPersonId || null,
        p_auto_assign: autoAssign || false
      });

      if (error) {
        console.error('❌ Erro ao atribuir entregador:', error);
        throw error;
      }

      console.log('✅ Entregador atribuído com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-delivery-persons'] });
      
      toast({
        title: "Entregador atribuído!",
        description: `${data.delivery_person_name} foi atribuído para esta entrega.`,
      });

      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Erro na atribuição:', error);
      toast({
        title: "Erro ao atribuir entregador",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleManualAssign = () => {
    if (!selectedPersonId) {
      toast({
        title: "Entregador não selecionado",
        description: "Por favor, selecione um entregador antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    assignDeliveryPerson.mutate({ deliveryPersonId: selectedPersonId });
  };

  const handleAutoAssign = () => {
    assignDeliveryPerson.mutate({ autoAssign: true });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <User className="h-6 w-6 text-blue-400" />
          Atribuir Entregador
        </>
      }
      description={
        currentDeliveryPersonId 
          ? `Entregador atual: ${currentDeliveryPersonName}. Selecione um novo entregador ou use atribuição automática.`
          : 'Selecione um entregador para esta entrega ou use a atribuição automática.'
      }
      size="4xl"
      className="bg-black/95 backdrop-blur-xl border-white/20"
    >

        <div className="space-y-6">
          {/* Botão de Atribuição Automática */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Atribuição Automática</h3>
                    <p className="text-sm text-gray-400">
                      Sistema escolhe o entregador mais adequado baseado na disponibilidade
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAutoAssign}
                  disabled={assignDeliveryPerson.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Atribuir Automaticamente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Entregadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Atribuição Manual</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-700/30 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-600/30 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-600/30 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-600/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : deliveryPersons.length === 0 ? (
              <Card className="bg-gray-800/30 border-gray-700/40">
                <CardContent className="py-8">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">Nenhum entregador disponível</h3>
                    <p className="text-gray-400 text-sm">
                      Não há entregadores cadastrados ou todos estão ocupados no momento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliveryPersons.map((person) => (
                  <Card
                    key={person.delivery_person_id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2",
                      selectedPersonId === person.delivery_person_id
                        ? "bg-blue-900/30 border-blue-400/50 shadow-lg shadow-blue-500/20"
                        : "bg-gray-800/30 border-gray-700/40 hover:border-gray-600/60",
                      !person.is_available && "opacity-60"
                    )}
                    onClick={() => person.is_available && setSelectedPersonId(person.delivery_person_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg border",
                          person.is_available 
                            ? "bg-green-500/20 border-green-400/30" 
                            : "bg-red-500/20 border-red-400/30"
                        )}>
                          <User className={cn(
                            "h-6 w-6",
                            person.is_available ? "text-green-400" : "text-red-400"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-white truncate">
                              {person.delivery_person_name}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                person.is_available 
                                  ? "border-green-400/50 text-green-400" 
                                  : "border-red-400/50 text-red-400"
                              )}
                            >
                              {person.is_available ? 'Disponível' : 'Ocupado'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Truck className="h-3 w-3" />
                              <span>{person.active_deliveries} entregas ativas</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>{person.completed_today} concluídas hoje</span>
                            </div>
                            
                            {person.avg_delivery_time_minutes > 0 && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>Tempo médio: {formatTime(person.avg_delivery_time_minutes)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Performance indicator */}
                          <div className="flex items-center gap-1 mt-3">
                            <Activity className="h-3 w-3 text-blue-400" />
                            <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                              <div 
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  person.active_deliveries <= 2 ? "bg-green-500" :
                                  person.active_deliveries <= 4 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ 
                                  width: `${Math.min((person.active_deliveries / 5) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {person.active_deliveries}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-700/50">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleManualAssign}
              disabled={!selectedPersonId || assignDeliveryPerson.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Atribuir Selecionado
            </Button>
          </div>
        </div>
    </BaseModal>
  );
};

export default DeliveryAssignmentModal;