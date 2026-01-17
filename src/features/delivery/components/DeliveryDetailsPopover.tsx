import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/shared/ui/primitives/popover';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Separator } from '@/shared/ui/primitives/separator';
import { 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Map, 
  Truck, 
  Package, 
  DollarSign,
  Calendar,
  CheckCircle,
  Ban,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { DeliveryOrder } from '@/features/delivery/types';
import DeliveryTimeline from './DeliveryTimeline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveryDetailsPopoverProps {
  delivery: DeliveryOrder;
  children: React.ReactNode;
  onUpdateStatus: (id: string, status: string) => void;
}

export const DeliveryDetailsPopover: React.FC<DeliveryDetailsPopoverProps> = ({
  delivery,
  children,
  onUpdateStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'preparing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'out_for_delivery': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  /* Translations added for consistency */
  const statusTranslations: Record<string, string> = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'preparing': 'Em Preparo',
    'ready_for_pickup': 'Pronto para Envio',
    'ready': 'Pronto para Envio',
    'out_for_delivery': 'Saiu para Entrega',
    'dispatched': 'Saiu para Entrega',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado'
  };

  const nextStatusMap: Record<string, { label: string, status: string, icon: React.ReactNode }> = {
    'pending': { label: 'Iniciar Preparo', status: 'preparing', icon: <Package size={14} /> },
    'preparing': { label: 'Sair p/ Entrega', status: 'out_for_delivery', icon: <Truck size={14} /> },
    'out_for_delivery': { label: 'Confirmar Entrega', status: 'delivered', icon: <CheckCircle size={14} /> },
  };

  const nextAction = nextStatusMap[delivery.delivery_status];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start" 
        sideOffset={10}
        className="w-[420px] p-0 bg-zinc-950 border-zinc-800 shadow-2xl"
      >
        <div className="flex flex-col max-h-[600px]">
          {/* Header Compacto */}
          <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-start">
             <div>
                <div className="flex items-center gap-2">
                   <h4 className="text-sm font-semibold text-white">Pedido #{delivery.id.slice(0, 8)}</h4>
                   <Badge variant="outline" className={`text-[10px] px-1.5 h-5 ${getStatusColor(delivery.delivery_status)}`}>
                      {statusTranslations[delivery.delivery_status] || delivery.delivery_status}
                   </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <Calendar size={10} />
                  {format(new Date(delivery.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
             </div>
             {/* Total no Header para visibilidade rápida */}
             <div className="text-right">
                <span className="text-xs text-zinc-500 block">Total</span>
                <span className="text-sm font-bold text-emerald-400">{formatCurrency(delivery.final_amount)}</span>
             </div>
          </div>

          <ScrollArea className="flex-1">
             <div className="p-4 space-y-6">
                
                {/* Cliente Info (Grid Compacto) */}
                <div className="bg-zinc-900/30 rounded-md p-3 border border-white/5 space-y-3">
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <User size={14} />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-white">{delivery.customer?.name || "Balcão"}</p>
                            {delivery.customer?.phone && (
                               <p className="text-xs text-zinc-500">{delivery.customer.phone}</p>
                            )}
                         </div>
                      </div>
                      {delivery.customer?.phone && (
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                           onClick={() => window.open(`https://wa.me/55${delivery.customer?.phone?.replace(/\D/g, '')}`, '_blank')}
                         >
                            <MessageCircle size={16} />
                         </Button>
                      )}
                   </div>
                   
                   <Separator className="bg-white/5" />

                   <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-zinc-500 mt-0.5" />
                        <div className="flex-1">
                          {delivery.delivery_address ? (() => {
                             const addr = delivery.delivery_address;
                             const street = addr.street || addr.logradouro || addr.address || '';
                             const number = addr.number || addr.numero || 'S/N';
                             const neighborhood = addr.neighborhood || addr.bairro || '';
                             const city = addr.city || addr.nome_municipio || addr.localidade || '';
                             const complement = addr.complement || addr.complemento;

                             return (
                                <>
                                  <p className="text-xs text-zinc-300 font-medium">
                                    {street}, {number}
                                  </p>
                                  {complement && (
                                    <p className="text-[10px] text-zinc-400">
                                      {complement}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-zinc-500">
                                    {neighborhood} • {city}
                                  </p>
                                </>
                             );
                          })() : (
                            <p className="text-xs text-zinc-500 italic">Retirada na loja (Balcão)</p>
                          )}
                        </div>
                      {delivery.delivery_address && (
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-6 w-6 text-zinc-400 hover:text-white"
                             onClick={() => {
                                const a = delivery.delivery_address;
                                const q = `${a?.street}, ${a?.number}, ${a?.city}`;
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
                             }}
                          >
                             <Map size={14} />
                          </Button>
                      )}
                   </div>
                </div>

                {/* Itens */}
                <div className="space-y-2">
                   <h5 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Itens do Pedido</h5>
                   <div className="space-y-1">
                      {delivery.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between text-xs py-1 hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                            <span className="text-zinc-300">
                               <span className="font-bold text-zinc-500 mr-2">{item.quantity}x</span> 
                               {item.product_name}
                            </span>
                            <span className="text-zinc-400 tabular-nums">{formatCurrency(item.unit_price * item.quantity)}</span>
                         </div>
                      ))}
                   </div>
                   <div className="flex justify-end pt-2 border-t border-white/5 gap-4 text-xs items-center">
                      <div className="flex items-center gap-2">
                         <span className="text-zinc-500">Entrega:</span>
                         {delivery.delivery_fee > 0 ? (
                            <span className="text-zinc-300">{formatCurrency(delivery.delivery_fee)}</span>
                         ) : (
                            <Badge variant="outline" className="text-[10px] rounded-sm px-1.5 h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                               Grátis
                            </Badge>
                         )}
                      </div>
                      {delivery.discount_amount > 0 && (
                         <span className="text-green-500">Desc: -{formatCurrency(delivery.discount_amount)}</span>
                      )}
                   </div>
                </div>

                {/* Timeline Compacta */}
                <div className="space-y-2">
                   <h5 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Histórico</h5>
                   {/* Simplified Timeline View */}
                   <div className="relative pl-3 space-y-4 border-l border-zinc-800 ml-1">
                      {delivery.tracking?.slice(0, 3).map((track, i) => (
                         <div key={i} className="relative">
                            <div className={`absolute -left-[17px] top-1 w-2 h-2 rounded-full border border-zinc-950 ${i === 0 ? 'bg-primary' : 'bg-zinc-700'}`} />
                            <p className={`text-xs ${i === 0 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                               {statusTranslations[track.status] || track.status}
                            </p>
                            <p className="text-[10px] text-zinc-600">{format(new Date(track.created_at), 'HH:mm')}</p>
                         </div>
                      ))}
                   </div>
                </div>

             </div>
          </ScrollArea>
           
          {/* Footer Actions */}
          <div className="p-3 border-t border-white/5 bg-zinc-900/80 backdrop-blur-sm grid grid-cols-2 gap-2">
             {!['delivered', 'cancelled'].includes(delivery.delivery_status) && (
                <Button 
                   variant="ghost" 
                   size="sm"
                   className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8"
                   onClick={() => {
                      onUpdateStatus(delivery.id, 'cancelled');
                      setIsOpen(false);
                   }}
                >
                   <Ban size={14} className="mr-2" /> Cancelar
                </Button>
             )}

             {nextAction && (
                <Button 
                   size="sm"
                   className={`${!['delivered', 'cancelled'].includes(delivery.delivery_status) ? 'col-span-1' : 'col-span-2'} h-8 bg-primary hover:bg-primary/90 text-primary-foreground`}
                   onClick={() => {
                      onUpdateStatus(delivery.id, nextAction.status);
                      setIsOpen(false);
                   }}
                >
                   {nextAction.icon} <span className="ml-2">{nextAction.label}</span>
                </Button>
             )}
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DeliveryDetailsPopover;
