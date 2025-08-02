/**
 * Modal de detalhes completos do cliente
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  Edit,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CustomerDetailModalProps } from './types';
import { CustomerSegmentBadge } from './CustomerSegmentBadge';
import { CustomerInsights } from './CustomerInsights';
import { 
  useCustomerInsights, 
  useCustomerInteractions, 
  useCustomerPurchases 
} from '@/hooks/use-crm';

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEdit,
  canEdit = false,
}) => {
  // Dados específicos do cliente selecionado
  const { data: insights = [], isLoading: isLoadingInsights } = useCustomerInsights(customer?.id || '');
  const { data: interactions = [], isLoading: isLoadingInteractions } = useCustomerInteractions(customer?.id || '');
  const { data: purchases = [], isLoading: isLoadingPurchases } = useCustomerPurchases(customer?.id || '');

  if (!customer) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatContactPreference = (preference: string | null) => {
    const preferences = {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'E-mail',
      call: 'Telefone'
    };
    return preference ? preferences[preference as keyof typeof preferences] || preference : 'Não definido';
  };

  const formatPurchaseFrequency = (frequency: string | null) => {
    const frequencies = {
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      occasional: 'Ocasional'
    };
    return frequency ? frequencies[frequency as keyof typeof frequencies] || frequency : 'Não definido';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-adega-charcoal border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-adega-platinum flex items-center gap-2">
              <User className="h-5 w-5" />
              {customer.name}
            </DialogTitle>
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(customer)}
                className="border-white/10 hover:bg-adega-gold/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Coluna 1: Informações Básicas */}
          <div className="space-y-4">
            {/* Informações de Contato */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.email || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.phone || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.address || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.birthday)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Segmentação */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum">Segmentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Segmento:</span>
                  <CustomerSegmentBadge segment={customer.segment || ''} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Preferência de contato:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatContactPreference(customer.contact_preference)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Frequência de compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatPurchaseFrequency(customer.purchase_frequency)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Permissão de contato:</span>
                  <Badge variant={customer.contact_permission ? "default" : "secondary"}>
                    {customer.contact_permission ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Dados de Compra */}
          <div className="space-y-4">
            {/* Métricas de Compra */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Métricas de Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Lifetime Value:</span>
                  <span className="font-semibold text-adega-gold">
                    {formatCurrency(customer.lifetime_value || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Primeira compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.first_purchase_date)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Última compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.last_purchase_date)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Categoria favorita:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {customer.favorite_category || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Produto favorito:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {customer.favorite_product || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Interações */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Interações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInteractions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-adega-gold mx-auto"></div>
                  </div>
                ) : interactions.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {interactions.slice(0, 5).map((interaction) => (
                      <div key={interaction.id} className="p-2 rounded bg-adega-charcoal/30">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-adega-platinum">
                            {interaction.interaction_type}
                          </span>
                          <span className="text-xs text-adega-platinum/40">
                            {formatDate(interaction.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-adega-platinum/70 mt-1">
                          {interaction.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-adega-platinum/60 text-center py-4">
                    Nenhuma interação registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Insights */}
          <div>
            <CustomerInsights
              customerId={customer.id}
              insights={insights}
              isLoading={isLoadingInsights}
            />
          </div>
        </div>

        {/* Notas */}
        {customer.notes && (
          <Card className="bg-adega-charcoal/20 border-white/10 mt-4">
            <CardHeader>
              <CardTitle className="text-sm text-adega-platinum">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-adega-platinum/80">
                {customer.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};