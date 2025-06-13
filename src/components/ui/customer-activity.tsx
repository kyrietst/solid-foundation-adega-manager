import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerInteraction, CustomerProfile } from '@/hooks/use-crm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MessageSquare, Phone, Mail, AlertTriangle } from 'lucide-react';

interface CustomerActivityProps {
  interactions: CustomerInteraction[];
  customers: CustomerProfile[];
  limit?: number;
}

export function CustomerActivity({ interactions, customers, limit = 5 }: CustomerActivityProps) {
  // Ordenar interações por data (mais recente primeiro)
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Limitar ao número especificado
  const limitedInteractions = sortedInteractions.slice(0, limit);

  // Função para obter o nome do cliente pelo ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente desconhecido';
  };

  // Função para obter o ícone do tipo de interação
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-purple-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'complaint':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter a classe de cor do tipo de interação
  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-700';
      case 'call':
        return 'bg-purple-100 text-purple-700';
      case 'email':
        return 'bg-green-100 text-green-700';
      case 'complaint':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {limitedInteractions.length > 0 ? (
          <div className="space-y-4">
            {limitedInteractions.map((interaction) => (
              <div key={interaction.id} className="flex items-start">
                <div className="mr-4 mt-1">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getInteractionIcon(interaction.interaction_type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{getCustomerName(interaction.customer_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(interaction.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium mr-2",
                      getInteractionColor(interaction.interaction_type)
                    )}>
                      {interaction.interaction_type}
                    </span>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {interaction.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Nenhuma atividade recente registrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 