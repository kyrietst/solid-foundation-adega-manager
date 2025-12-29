import { useSales, useDeleteSale } from "@/features/sales/hooks/use-sales";
import { Skeleton } from "@/shared/ui/composite/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { Button } from "@/shared/ui/primitives/button";
import { FileText, Download, CalendarDays, CreditCard, ChevronRight, User, Truck, Trash2, Eye, Package, Store } from "lucide-react";
import { useAuth } from "@/app/providers/AuthContext";
import { useState } from "react";
import { useToast } from "@/shared/hooks/common/use-toast";
import { text, shadows } from "@/core/config/theme";
import { cn } from "@/core/config/utils";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/alert-dialog";

import { SaleStatusBadge } from "./SaleStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

export function RecentSales() {
  const { data: sales, isLoading } = useSales({ limit: 20 });
  const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();
  const { user, userRole } = useAuth();
  const [saleToDelete, setSaleToDelete] = useState<{ id: string, number: number } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Alterna a exibição dos detalhes da venda
  const toggleSaleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const handleDeleteClick = (saleId: string, saleNumber: number) => {
    setSaleToDelete({ id: saleId, number: saleNumber });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!saleToDelete) return;

    if (!user) {
      toast({
        title: "Sessão Expirada",
        description: "Faça login novamente para realizar esta ação.",
        variant: "destructive",
      });
      return;
    }

    // Executa a mutação de exclusão
    deleteSale({ saleId: saleToDelete.id, user }, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSaleToDelete(null);
        toast({
          title: "Venda excluída",
          description: "A venda foi removida com sucesso.",
          variant: "default",
        });
      },
      onError: (error) => {
        console.error('Erro na exclusão:', error);
        toast({
          title: "Erro na exclusão",
          description: "Não foi possível excluir a venda. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleViewFullHistory = () => {
    // Navega para página de movimentações (histórico completo)
    navigate('/movements');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'bank_transfer': 'Transferência Bancária',
      'other': 'Outro'
    };
    return methods[method] || method;
  };

  const formatDeliveryType = (type: string) => {
    const typeMap: Record<string, string> = {
      'presencial': 'Presencial',
      'delivery': 'Delivery',
      'pickup': 'Retirada'
    };
    return typeMap[type] || type;
  };

  const getDeliveryTypeIcon = (type: string) => {
    switch (type) {
      case 'presencial':
        return 'Store';
      case 'delivery':
        return 'Truck';
      case 'pickup':
        return 'Package';
      default:
        return 'Store';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={cn(text.h2, shadows.medium, "text-2xl font-bold tracking-tight")}>
              Vendas Recentes
            </h2>
            <p className={cn(text.h6, shadows.subtle, "text-sm")}>
              Visualize as últimas transações realizadas ({sales?.length || 0} vendas)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button size="sm" className="gap-2">
              <span className="hidden sm:inline">Nova Venda</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Área scrollável */}
      <div className="flex-1 min-h-0">
        {sales?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-black/30 border border-white/20 backdrop-blur-xl rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className={cn(text.h4, shadows.medium, "text-lg font-medium")}>
              Nenhuma venda encontrada
            </h3>
            <p className={cn(text.h6, shadows.subtle, "text-sm text-center max-w-md mt-1")}>
              Quando você realizar vendas, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-amber-400/30 scrollbar-track-transparent hover:scrollbar-thumb-amber-400/50 scroll-smooth">
            {/* Indicador de scroll (aparece quando há scroll) */}
            <div className="sticky top-0 z-10 mb-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="bg-gradient-to-r from-transparent via-amber-400/20 to-transparent h-px w-full" />
              <div className="text-center text-xs text-amber-400/60 mt-1">
                {sales && sales.length > 10 ? '⬇ Role para ver mais vendas ⬇' : ''}
              </div>
            </div>

            {sales?.map((sale) => (
              <div
                key={sale.id}
                className="bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg p-4 hover:shadow-xl transition-all duration-200 hero-spotlight"
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                  (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {sale.delivery_type === 'delivery' ? (
                        <Truck className="h-5 w-5 text-green-400" />
                      ) : (
                        <Store className="h-5 w-5 text-blue-400" />
                      )}
                      <h3 className={cn(text.h3, shadows.medium, "font-semibold text-lg")}>
                        {sale.delivery_type === 'delivery' ? 'Pedido' : 'Venda'} #{sale.order_number}
                      </h3>
                      <SaleStatusBadge sale={sale} />
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                        <span className={cn(text.h6, shadows.subtle)}>
                          {formatPaymentMethod(sale.payment_method)}
                        </span>
                        <PaymentStatusBadge status={sale.payment_status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        <span className={cn(text.h6, shadows.subtle)}>
                          Vendedor: {sale.seller?.name || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-400" />
                        <span className={cn(text.h6, shadows.subtle)}>
                          Cliente: {sale.customer?.name || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = getDeliveryTypeIcon(sale.delivery_type) === 'Store' ? Store :
                            getDeliveryTypeIcon(sale.delivery_type) === 'Truck' ? Truck : Package;
                          return <IconComponent className="h-4 w-4 text-orange-400" />;
                        })()}
                        <span className={cn(text.h6, shadows.subtle)}>
                          Tipo: {formatDeliveryType(sale.delivery_type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-400" />
                        <span className={cn(text.h6, shadows.subtle)}>
                          {formatDate(sale.created_at)}
                        </span>
                      </div>

                      {/* Telefone do cliente */}
                      {sale.customer?.phone && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-400" />
                          <span className={cn(text.h6, shadows.subtle)}>
                            Tel: {sale.customer.phone}
                          </span>
                        </div>
                      )}

                      {/* Informações específicas de delivery */}
                      {sale.delivery_type === 'delivery' && (
                        <>
                          {/* Endereço de entrega */}
                          {sale.delivery_address && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-green-400" />
                              <span className={cn(text.h6, shadows.subtle)}>
                                Endereço: {`${sale.delivery_address.street}, ${sale.delivery_address.number}${sale.delivery_address.complement ? ` - ${sale.delivery_address.complement}` : ''} - ${sale.delivery_address.neighborhood}`}
                              </span>
                            </div>
                          )}

                          {/* Taxa de entrega */}
                          {sale.delivery_fee && sale.delivery_fee > 0 && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-yellow-400" />
                              <span className={cn(text.h6, shadows.subtle)}>
                                Taxa: {formatCurrency(sale.delivery_fee)}
                              </span>
                            </div>
                          )}

                          {/* Entregador */}
                          {sale.delivery_person?.name && (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-purple-400" />
                              <span className={cn(text.h6, shadows.subtle)}>
                                Entregador: {sale.delivery_person.name}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className={cn(text.h1, shadows.strong, "text-xl font-bold text-right")}>
                      {formatCurrency(sale.final_amount || sale.total_amount)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-black/50 border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm"
                        onClick={() => toggleSaleDetails(sale.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {expandedSaleId === sale.id ? 'Ocultar' : 'Detalhes'}
                      </Button>
                      {(userRole === 'admin' || userRole === 'employee') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-black/50 border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                          onClick={() => handleDeleteClick(sale.id, sale.order_number)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes expandidos da venda */}
                {expandedSaleId === sale.id && (
                  <div className="mt-4 pt-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-emerald-400" />
                      <h4 className={cn(text.h4, shadows.medium, "font-medium text-emerald-400")}>
                        Itens da venda ({sale.items?.length || 0})
                      </h4>
                    </div>
                    {sale.items && sale.items.length > 0 ? (
                      <div className="space-y-3">
                        {sale.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm bg-black/30 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-500/20 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                {item.quantity}
                              </div>
                              <div>
                                <span className={cn(text.h5, shadows.light, "font-medium text-white")}>
                                  {item.product?.name || 'Produto não encontrado'}
                                </span>
                                <div className="text-xs text-gray-400">
                                  {formatCurrency(item.unit_price)} por unidade
                                </div>
                              </div>
                            </div>
                            <div className={cn(text.h4, shadows.light, "font-bold text-emerald-400")}>
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-amber-500/10 rounded-lg border border-amber-400/30">
                        <Package className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                        <p className={cn(text.h6, shadows.subtle, "text-sm text-amber-300 font-medium")}>
                          Venda sem itens registrados
                        </p>
                        <p className={cn(text.h6, shadows.subtle, "text-xs text-amber-400/70 mt-1")}>
                          Esta venda pode ter sido criada antes da implementação do sistema de itens ou teve seus itens removidos.
                        </p>
                      </div>
                    )}

                    {sale.notes && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-amber-400" />
                          <h4 className={cn(text.h5, shadows.medium, "font-medium text-amber-400")}>
                            Observações:
                          </h4>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                          <p className={cn(text.h6, shadows.subtle, "text-sm text-gray-300")}>
                            {sale.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Botão Ver histórico dentro da área scrollável */}
            <div className="flex justify-center pt-6 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-black/50 border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all duration-300"
                onClick={handleViewFullHistory}
              >
                Ver histórico completo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido #{saleToDelete?.number}?
              <br /><br />
              <strong>Esta ação irá:</strong>
              <br />• Remover a venda do sistema
              <br />• Restaurar o estoque dos produtos
              <br />• Registrar a operação no log de auditoria
              <br /><br />
              <span className="text-amber-400">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="bg-black/50 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  Excluindo...
                </div>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
