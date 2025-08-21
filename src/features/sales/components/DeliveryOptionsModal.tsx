/**
 * @fileoverview Modal para captura de dados específicos de delivery
 * Integra com calculadora de taxa de entrega e validação de endereços
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/primitives/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Calculator 
} from 'lucide-react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { cn } from '@/core/config/utils';

export interface DeliveryData {
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    zipCode: string;
    reference?: string;
  };
  deliveryFee: number;
  estimatedTime: number;
  zoneId: string;
  zoneName: string;
  instructions?: string;
  minimumOrderValue: number;
  isEligible: boolean;
}

interface DeliveryOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DeliveryData) => void;
  orderValue: number;
}

interface DeliveryZone {
  zone_id: string;
  zone_name: string;
  delivery_fee: number;
  estimated_time_minutes: number;
  minimum_order_value: number;
  is_eligible: boolean;
}

export const DeliveryOptionsModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderValue 
}: DeliveryOptionsModalProps) => {
  const { toast } = useToast();
  
  // Estados do formulário
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    zipCode: '',
    reference: ''
  });
  
  const [instructions, setInstructions] = useState('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Buscar zonas de entrega disponíveis
  const { data: deliveryZones } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('delivery_fee', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Calcular taxa de entrega baseada no endereço
  const calculateDeliveryFee = async () => {
    if (!address.street || !address.neighborhood) {
      toast({
        title: "Endereço incompleto",
        description: "Por favor, preencha pelo menos rua e bairro para calcular a taxa de entrega.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Coordenadas simuladas baseadas no bairro (em produção, usar API de geocoding)
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;
      
      const { data, error } = await supabase.rpc('calculate_delivery_fee', {
        p_latitude: mockLatitude,
        p_longitude: mockLongitude,
        p_order_value: orderValue
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const zone = data[0];
        setSelectedZone({
          zone_id: zone.zone_id,
          zone_name: zone.zone_name,
          delivery_fee: parseFloat(zone.delivery_fee),
          estimated_time_minutes: zone.estimated_time_minutes,
          minimum_order_value: parseFloat(zone.minimum_order_value),
          is_eligible: zone.is_eligible
        });
        
        toast({
          title: "Taxa calculada!",
          description: `${zone.zone_name} - R$ ${parseFloat(zone.delivery_fee).toFixed(2)} - ${zone.estimated_time_minutes}min`,
        });
      } else {
        toast({
          title: "Área não atendida",
          description: "Este endereço não está em nossa área de entrega.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao calcular taxa de entrega:', error);
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular a taxa de entrega. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Confirmar dados de delivery
  const handleConfirm = () => {
    if (!selectedZone) {
      toast({
        title: "Taxa não calculada",
        description: "Por favor, calcule a taxa de entrega antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedZone.is_eligible) {
      toast({
        title: "Valor mínimo não atingido",
        description: `O valor mínimo para esta zona é R$ ${selectedZone.minimum_order_value.toFixed(2)}.`,
        variant: "destructive"
      });
      return;
    }

    const deliveryData: DeliveryData = {
      address,
      deliveryFee: selectedZone.delivery_fee,
      estimatedTime: selectedZone.estimated_time_minutes,
      zoneId: selectedZone.zone_id,
      zoneName: selectedZone.zone_name,
      instructions,
      minimumOrderValue: selectedZone.minimum_order_value,
      isEligible: selectedZone.is_eligible
    };

    onConfirm(deliveryData);
  };

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setAddress({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'São Paulo',
        zipCode: '',
        reference: ''
      });
      setInstructions('');
      setSelectedZone(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <MapPin className="h-6 w-6 text-green-400" />
            Dados para Entrega
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha os dados de endereço para calcular a taxa de entrega
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Pedido */}
          <Card className="bg-gray-800/30 border-gray-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-white">
                <span>Valor do Pedido:</span>
                <span className="font-bold">R$ {orderValue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-white">Rua/Avenida *</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                placeholder="Ex: Av. Paulista"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number" className="text-white">Número *</Label>
              <Input
                id="number"
                value={address.number}
                onChange={(e) => setAddress({...address, number: e.target.value})}
                placeholder="123"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complement" className="text-white">Complemento</Label>
              <Input
                id="complement"
                value={address.complement}
                onChange={(e) => setAddress({...address, complement: e.target.value})}
                placeholder="Apto 45, Bloco B"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-white">Bairro *</Label>
              <Input
                id="neighborhood"
                value={address.neighborhood}
                onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                placeholder="Ex: Bela Vista"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-white">CEP</Label>
              <Input
                id="zipCode"
                value={address.zipCode}
                onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                placeholder="01310-100"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" className="text-white">Cidade</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference" className="text-white">Ponto de Referência</Label>
            <Input
              id="reference"
              value={address.reference}
              onChange={(e) => setAddress({...address, reference: e.target.value})}
              placeholder="Ex: Próximo ao metrô Trianon-MASP"
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          {/* Botão Calcular Taxa */}
          <div className="flex justify-center">
            <Button
              onClick={calculateDeliveryFee}
              disabled={isCalculating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Calcular Taxa de Entrega'}
            </Button>
          </div>

          {/* Resultado do Cálculo */}
          {selectedZone && (
            <Card className={cn(
              "border-2",
              selectedZone.is_eligible 
                ? "bg-green-900/20 border-green-500/50" 
                : "bg-red-900/20 border-red-500/50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  {selectedZone.is_eligible ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                  Resultado do Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <span className="text-gray-400">Zona:</span>
                    <div className="font-semibold">{selectedZone.zone_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Taxa de Entrega:</span>
                    <div className="font-semibold text-green-400">
                      R$ {selectedZone.delivery_fee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Tempo Estimado:</span>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedZone.estimated_time_minutes} min
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Valor Mínimo:</span>
                    <div className="font-semibold">
                      R$ {selectedZone.minimum_order_value.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {!selectedZone.is_eligible && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                    <div className="text-red-300 text-sm">
                      ⚠️ Valor do pedido está abaixo do mínimo para esta zona.
                      Adicione mais R$ {(selectedZone.minimum_order_value - orderValue).toFixed(2)} ao carrinho.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instruções Especiais */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-white">Instruções Especiais</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: Entregar na portaria, tocar campainha do apto..."
              className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedZone || !selectedZone.is_eligible}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirmar Entrega
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};