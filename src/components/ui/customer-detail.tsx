import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileCompletenessIndicator } from '@/components/ui/profile-completeness';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Check, CreditCard, MessageSquare, Phone, X, Trash } from 'lucide-react';
import { CustomerProfile, CustomerInsight, CustomerInteraction, CustomerPurchase, useProfileCompleteness, useUpsertCustomer, useAddCustomerInteraction } from '@/hooks/use-crm';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useDeleteCustomerInteraction } from '@/hooks/use-delete-customer-interaction';
import { useProduct } from '@/hooks/use-product';
import { useCustomerTimeline } from '@/hooks/use-customer-timeline';
import { useCustomerStats } from '@/hooks/use-customer-stats';
import { useCustomerPurchases } from '@/hooks/use-customer-purchases';

interface CustomerDetailProps {
  customer: CustomerProfile;
  insights?: CustomerInsight[];
  interactions?: CustomerInteraction[];
}

export function CustomerDetail({ 
  customer, 
  insights = [], 
  interactions = [], 
}: CustomerDetailProps) {
  const { user, hasPermission } = useAuth();
  const completeness = useProfileCompleteness(customer);
  const upsertCustomer = useUpsertCustomer();
  const addInteraction = useAddCustomerInteraction();
  // Carrega nome do produto favorito se existir
  const { data: favoriteProduct } = useProduct(customer.favorite_product);
  const { data: timeline = [] } = useCustomerTimeline(customer.id);
  const { data: stats } = useCustomerStats(customer.id);
  const { data: purchases = [] } = useCustomerPurchases(customer.id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<CustomerProfile>>(customer);
  const [newInteraction, setNewInteraction] = useState({
    customer_id: customer.id,
    interaction_type: 'note',
    description: '',
    created_by: user?.id || '',
    associated_sale_id: null
  });

  // lista local para refletir deleções
  const deleteInteraction = useDeleteCustomerInteraction();
  const [interactionList, setInteractionList] = useState(interactions.filter(i => i.interaction_type !== 'fiado'));
  useEffect(() => setInteractionList(interactions.filter(i=> i.interaction_type !== 'fiado')), [interactions]);

  const handleDeleteInteraction = (id: string) => {
    if (!window.confirm('Excluir esta interação?')) return;
    deleteInteraction.mutate(id, {
      onSuccess: () => setInteractionList(prev => prev.filter(i => i.id !== id))
    });
  };

  const handleSaveCustomer = async () => {
    await upsertCustomer.mutateAsync(editedCustomer);
    setIsEditDialogOpen(false);
  };

  const handleAddInteraction = async () => {
    await addInteraction.mutateAsync(newInteraction);
    setNewInteraction({
      ...newInteraction,
      description: ''
    });
    setIsInteractionDialogOpen(false);
  };

  const handleAddInfoFromSuggestion = (suggestion: string) => {
    setIsEditDialogOpen(true);
    // Focar no campo sugerido
    const fieldMap: Record<string, string> = {
      'Adicionar Telefone': 'phone',
      'Adicionar Email': 'email',
      'Completar Endereço': 'address',
      'Completar Data de aniversário': 'birthday',
      'Adicionar Preferência de contato': 'contact_preference',
      'Adicionar Permissão de contato': 'contact_permission',
      'Completar Observações': 'notes',
    };
    
    const field = fieldMap[suggestion];
    if (field) {
      // Aqui você poderia implementar um foco no campo específico
      console.log(`Focando no campo: ${field}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            {customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="ml-3 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{customer.email}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsInteractionDialogOpen(true)}
          >
            Registrar Interação
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Editar Cliente
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ProfileCompletenessIndicator 
            score={completeness.score}
            nextSuggestions={completeness.suggestions}
            onAddInfo={handleAddInfoFromSuggestion}
          />
        </div>
        
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm inline-flex items-center font-medium",
              customer.segment === 'VIP' && "bg-purple-100 text-purple-700",
              customer.segment === 'Regular' && "bg-blue-100 text-blue-700",
              customer.segment === 'Novo' && "bg-green-100 text-green-700",
              customer.segment === 'Inativo' && "bg-gray-100 text-gray-700",
              customer.segment === 'Em risco' && "bg-red-100 text-red-700",
            )}>
              {customer.segment || 'Não definido'}
            </div>
            
            {customer.lifetime_value > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Valor total gasto</p>
                <p className="text-lg font-semibold">
                  R$ {customer.lifetime_value.toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="interactions">Interações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p>{customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p>{customer.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{customer.email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aniversário</p>
                  <p>{customer.birthday ? format(new Date(customer.birthday), 'dd/MM/yyyy') : 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p>{customer.address ? JSON.stringify(customer.address) : 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferência de Contato</p>
                  <p>{customer.contact_preference || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Permissão de Contato</p>
                  <p>{customer.contact_permission ? 'Sim' : 'Não'}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                  {purchases.length > 0 ? (
                    <div className="space-y-3">
                      {purchases.slice(0, 3).map((purchase) => (
                        <div key={purchase.purchase_id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{format(new Date(purchase.created_at), 'dd/MM/yyyy')}</p>
                            <p className="text-xs text-muted-foreground">
                              {(purchase.items ? purchase.items.length : 0)} {(purchase.items ? purchase.items.length : 0) === 1 ? 'item' : 'itens'}
                            </p>
                          </div>
                          <p className="font-semibold">R$ {(purchase.total ?? 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma compra registrada</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Preferências Detectadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.favorite_category || customer.favorite_product ? (
                    <div className="space-y-2">
                      {customer.favorite_category && (
                        <div>
                          <p className="text-xs text-muted-foreground">Categoria Favorita</p>
                          <p>{customer.favorite_category}</p>
                        </div>
                      )}
                      {customer.favorite_product && (
                        <div>
                          <p className="text-xs text-muted-foreground">Produto Favorito</p>
                          <p>{favoriteProduct?.name ?? customer.favorite_product}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma preferência detectada</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="purchases">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="pt-6">
              {purchases.length > 0 ? (
                <div className="space-y-6">
                  {purchases.map((purchase) => (
                    <div key={purchase.purchase_id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{format(new Date(purchase.created_at), 'dd/MM/yyyy')}</p>
                          <p className="text-xs text-muted-foreground">ID: {purchase.purchase_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {(purchase.total ?? 0).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {(purchase.items ? purchase.items.length : 0)} {(purchase.items ? purchase.items.length : 0) === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-md p-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground">
                              <th className="text-left pb-2">Produto</th>
                              <th className="text-center pb-2">Qtd</th>
                              <th className="text-right pb-2">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(purchase.items ?? []).map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td className="py-1">{item.product_name}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">R$ {((item.unit_price ?? 0) as number).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="mt-2 text-muted-foreground">Nenhuma compra registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="pt-6">
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          insight.insight_type === 'preference' && "bg-blue-100 text-blue-700",
                          insight.insight_type === 'pattern' && "bg-purple-100 text-purple-700",
                          insight.insight_type === 'opportunity' && "bg-green-100 text-green-700",
                          insight.insight_type === 'risk' && "bg-red-100 text-red-700",
                        )}>
                          {insight.insight_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(insight.created_at), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-xs ml-auto">
                          Confiança: {(insight.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p>{insight.insight_value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum insight gerado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interactions">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-end mb-4">
                <Button 
                  size="sm"
                  onClick={() => setIsInteractionDialogOpen(true)}
                >
                  Nova Interação
                </Button>
              </div>
              
              {interactionList.length > 0 ? (
                <div className="space-y-4">
                  {interactionList.map((interaction) => (
                    <div key={interaction.id} className="border-b pb-4 flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          interaction.interaction_type === 'note' && "bg-blue-100 text-blue-700",
                          interaction.interaction_type === 'call' && "bg-purple-100 text-purple-700",
                          interaction.interaction_type === 'email' && "bg-green-100 text-green-700",
                          interaction.interaction_type === 'complaint' && "bg-red-100 text-red-700",
                        )}>
                          {interaction.interaction_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p>{interaction.description}</p>
            {hasPermission('admin') && (
              <Button variant="ghost" size="icon" onClick={() => handleDeleteInteraction(interaction.id)}>
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma interação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de edição do cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editedCustomer.name || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={editedCustomer.phone || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedCustomer.email || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="birthday">Data de Aniversário</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedCustomer.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedCustomer.birthday ? (
                      format(new Date(editedCustomer.birthday), 'dd/MM/yyyy')
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedCustomer.birthday ? new Date(editedCustomer.birthday) : undefined}
                    onSelect={(date) => setEditedCustomer({
                      ...editedCustomer,
                      birthday: date ? date.toISOString() : null
                    })}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact_preference">Preferência de Contato</Label>
              <Select
                value={editedCustomer.contact_preference || ''}
                onValueChange={(value) => setEditedCustomer({
                  ...editedCustomer,
                  contact_preference: value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma preferência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedCustomer.contact_permission || false}
                  onChange={(e) => setEditedCustomer({
                    ...editedCustomer,
                    contact_permission: e.target.checked
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Permissão para contato
              </Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={editedCustomer.notes || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCustomer} disabled={upsertCustomer.isPending}>
              {upsertCustomer.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de nova interação */}
      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Interação</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="interaction_type">Tipo de Interação</Label>
              <Select
                value={newInteraction.interaction_type}
                onValueChange={(value) => setNewInteraction({
                  ...newInteraction,
                  interaction_type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Anotação</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="complaint">Reclamação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newInteraction.description}
                onChange={(e) => setNewInteraction({
                  ...newInteraction,
                  description: e.target.value
                })}
                rows={4}
                placeholder="Descreva a interação com o cliente..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsInteractionDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleAddInteraction} 
              disabled={addInteraction.isPending || !newInteraction.description}
            >
              {addInteraction.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}