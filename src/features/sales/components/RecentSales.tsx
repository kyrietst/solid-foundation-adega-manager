import { useSales, useDeleteSale } from "@/features/sales/hooks/use-sales";
import { Skeleton } from "@/shared/ui/composite/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { Button } from "@/shared/ui/primitives/button";
import { FileText, Download, CalendarDays, CreditCard, ChevronRight, User, Truck, Trash2, Eye, Package, Store, QrCode } from "lucide-react";
import { useAuth } from "@/app/providers/AuthContext";
import { useState } from "react";
import { useToast } from "@/shared/hooks/common/use-toast";
import { cn } from "@/core/config/utils";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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

import { Badge } from '@/shared/ui/primitives/badge';
import { SettlementModal } from './SettlementModal';
import { DollarSign } from 'lucide-react';
import { SaleStatusBadge } from "./SaleStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { FiscalStatusBadge } from "@/features/fiscal/components/FiscalStatusBadge";
import { useFiscalEmission } from "@/features/fiscal/hooks/useFiscalEmission";
import { LoadingSpinner } from "@/shared/ui/composite/loading-spinner";
import { ReceiptModal } from "./ReceiptModal";
import { FiscalResponse } from "@/features/fiscal/hooks/useFiscalEmission";

interface RecentSalesProps {
  filterStatus?: string;
}

export function RecentSales({ filterStatus }: RecentSalesProps) {
  const { data: sales, isLoading } = useSales({ 
    limit: 20,
    paymentStatus: filterStatus 
  });
  const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();
  const { user, userRole } = useAuth();
  const [saleToDelete, setSaleToDelete] = useState<{ id: string, number: number } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { emitInvoice, isLoading: isFiscalProcessing } = useFiscalEmission();
  const [processingSaleId, setProcessingSaleId] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [fiscalResponseData, setFiscalResponseData] = useState<FiscalResponse['data'] | null>(null);

  // Settlement State
  const [settlementSale, setSettlementSale] = useState<{ id: string; total: number; customerName: string } | null>(null);

  const handleOpenSettlement = (sale: any) => {
    setSettlementSale({
        id: sale.id,
        total: sale.final_amount,
        customerName: sale.customer?.name || 'Consumidor Final'
    });
  };

  // Alterna a exibição dos detalhes da venda
  const toggleSaleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const handleDeleteClick = (saleId: string, saleNumber: number) => {
    setSaleToDelete({ id: saleId, number: saleNumber });
    setIsDeleteDialogOpen(true);
  };

  const handleEmitFiscal = async (saleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita expandir o card
    if (processingSaleId) return;

    setProcessingSaleId(saleId);
    await emitInvoice(saleId, (data) => {
      // Atualiza a lista
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      // Abre o modal de recibo com os dados fiscais
      setSelectedSaleId(saleId);
      setFiscalResponseData(data);
      setReceiptModalOpen(true);
    });
    setProcessingSaleId(null);
  };

  const handleViewFiscal = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  }

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
            <h2 className="text-2xl font-bold tracking-tight text-foreground shadow-sm">
              Vendas Recentes
            </h2>
            <p className="text-sm text-muted-foreground shadow-sm">
              Visualize as últimas transações realizadas ({sales?.length || 0} vendas)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button size="sm" className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
              <span className="hidden sm:inline">Nova Venda</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Área scrollável */}
      <div className="flex-1 min-h-0">
        {sales?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-surface/50 border border-white/20 backdrop-blur-xl rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground shadow-sm">
              Nenhuma venda encontrada
            </h3>
            <p className="text-sm text-center max-w-md mt-1 text-muted-foreground shadow-sm">
              Quando você realizar vendas, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-brand/30 scrollbar-track-transparent hover:scrollbar-thumb-brand/50 scroll-smooth">
            {/* Indicador de scroll (aparece quando há scroll) */}
            <div className="sticky top-0 z-10 mb-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="bg-gradient-to-r from-transparent via-brand/20 to-transparent h-px w-full" />
              <div className="text-center text-xs text-brand/60 mt-1">
                {sales && sales.length > 10 ? '⬇ Role para ver mais vendas ⬇' : ''}
              </div>
            </div>

            {sales?.map((sale) => (
              <div
                key={sale.id}
                className="bg-surface/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg p-4 hover:shadow-xl transition-all duration-200 hero-spotlight"
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
                      <h3 className="font-semibold text-lg text-foreground shadow-sm">
                        {sale.delivery_type === 'delivery' ? 'Pedido' : 'Venda'} #{sale.order_number}
                      </h3>
                      {/* Hide Concluido badge for Fiado (pending) */}
                      {sale.payment_status !== 'pending' && <SaleStatusBadge sale={sale} />}
                      
                      {/* Delivery Badge */}
                      {sale.delivery_type === 'delivery' && (
                           <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs px-2 py-0.5">
                               Entrega
                           </Badge>
                      )}

                      {/* Badge Fiscal */}
                      <FiscalStatusBadge status={sale.invoice?.status} />
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                        <span className="text-muted-foreground shadow-sm">
                          {formatPaymentMethod(sale.payment_method)}
                        </span>
                        
                        {/* Installment Badge for Credit Card - Simplified */}
                        {(sale.payment_method_enum === 'credit' || sale.payment_method === 'Cartão de Crédito') && sale.installments && sale.installments > 1 ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-0.5 hover:bg-blue-500/30">
                                {sale.installments}x
                            </Badge>
                        ) : (
                            <PaymentStatusBadge status={sale.payment_status} />
                        )}
                      </div>
                      
                      {/* REMOVED DUPLICATE TIPO LINE HERE */}

                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        <span className="text-muted-foreground shadow-sm">
                          Vendedor: {sale.seller?.name || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-brand" />
                        <span className="text-muted-foreground shadow-sm">
                          Cliente: {sale.customer?.name || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const isFiado = sale.payment_status === 'pending';
                          const IconComponent = getDeliveryTypeIcon(sale.delivery_type) === 'Store' ? Store :
                            getDeliveryTypeIcon(sale.delivery_type) === 'Truck' ? Truck : Package;
                          return <IconComponent className={cn("h-4 w-4", isFiado ? "text-destructive" : "text-brand")} />;
                        })()}
                        <span className={cn("text-muted-foreground shadow-sm", sale.payment_status === 'pending' ? "text-destructive font-medium" : "")}>
                          Tipo: {sale.payment_status === 'pending' 
                                  ? ((sale.delivery_type === 'delivery' || sale.delivery) ? 'Delivery Fiado' : 'Presencial Fiado') 
                                  : formatDeliveryType(sale.delivery_type)}
                        </span>
                      </div>

                       {/* Action Buttons */}
                       <div className="flex items-center gap-2 mt-1">
                          {sale.payment_status === 'pending' && sale.status !== 'cancelled' && (
                              <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenSettlement(sale);
                                  }}
                                  className="h-6 px-2 border-green-800/50 bg-green-900/10 text-green-500 hover:bg-green-900/30 hover:text-green-400 text-xs"
                              >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Quitar
                              </Button>
                          )}
                       </div>

                      {/* Botão Fiscal Inline - AÇÃO RÁPIDA */}
                      <div className="flex items-center gap-2 mt-1">
                        {sale.invoice && sale.invoice.status === 'authorized' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs"
                            onClick={(e) => handleViewFiscal(sale.invoice!.pdf_url || '', e)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Ver NFC-e
                          </Button>
                        ) : (
                           // Mostrar botão de emitir apenas se não estiver cancelado ou reembolsado
                           (sale.status !== 'cancelled' && sale.status !== 'refunded') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 text-xs"
                              disabled={isFiscalProcessing && processingSaleId === sale.id}
                              onClick={(e) => handleEmitFiscal(sale.id, e)}
                            >
                              {isFiscalProcessing && processingSaleId === sale.id ? (
                                <LoadingSpinner size="sm" color="default" />
                              ) : (
                                <QrCode className="h-3 w-3 mr-1" />
                              )}
                              {isFiscalProcessing && processingSaleId === sale.id ? 'Emitindo...' : 'Emitir Cupom Fiscal'}
                            </Button>
                           )
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-400" />
                        <span className="text-muted-foreground shadow-sm">
                          {formatDate(sale.created_at)}
                        </span>
                      </div>

                      {/* Telefone do cliente */}
                      {sale.customer?.phone && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-400" />
                          <span className="text-muted-foreground shadow-sm">
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
                              <span className="text-muted-foreground shadow-sm">
                                Endereço: {`${sale.delivery_address.logradouro || sale.delivery_address.street}, ${sale.delivery_address.numero || sale.delivery_address.number}${sale.delivery_address.complemento || sale.delivery_address.complement ? ` - ${sale.delivery_address.complemento || sale.delivery_address.complement}` : ''} - ${sale.delivery_address.bairro || sale.delivery_address.neighborhood}, ${sale.delivery_address.nome_municipio || sale.delivery_address.city}/${sale.delivery_address.uf || sale.delivery_address.state}`}
                              </span>
                            </div>
                          )}

                          {/* Taxa de entrega */}
                          {sale.delivery_fee && sale.delivery_fee > 0 && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-brand" />
                              <span className="text-muted-foreground shadow-sm">
                                Taxa: {formatCurrency(sale.delivery_fee)}
                              </span>
                            </div>
                          )}

                          {/* Entregador */}
                          {sale.delivery_person?.name && (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-purple-400" />
                              <span className="text-muted-foreground shadow-sm">
                                Entregador: {sale.delivery_person.name}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xl font-bold text-right text-foreground shadow-sm">
                      {formatCurrency(sale.final_amount || sale.total_amount)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-surface/50 border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm"
                        onClick={() => toggleSaleDetails(sale.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {expandedSaleId === sale.id ? 'Ocultar' : 'Detalhes'}
                      </Button>
                      {(userRole === 'admin' || userRole === 'employee') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-surface/50 border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
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
                      <h4 className="font-medium text-emerald-400 shadow-sm">
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
                                <span className="font-medium text-white shadow-sm">
                                  {item.product?.name || 'Produto não encontrado'}
                                </span>
                                <div className="text-xs text-gray-400">
                                  {formatCurrency(item.unit_price)} por unidade
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-emerald-400 shadow-sm">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-brand/10 rounded-lg border border-brand/30">
                        <Package className="h-8 w-8 text-brand mx-auto mb-2" />
                        <p className="text-sm text-brand font-medium shadow-sm">
                          Venda sem itens registrados
                        </p>
                        <p className="text-xs text-brand/70 mt-1 shadow-sm">
                          Esta venda pode ter sido criada antes da implementação do sistema de itens ou teve seus itens removidos.
                        </p>
                      </div>
                    )}

                    {sale.notes && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-brand" />
                          <h4 className="font-medium text-brand shadow-sm">
                            Observações:
                          </h4>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                          <p className="text-sm text-gray-300 shadow-sm">
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
                className="gap-2 bg-surface/50 border-brand/30 text-brand hover:bg-brand/10 hover:border-brand/50 transition-all duration-300"
                onClick={handleViewFullHistory}
              >
                Ver histórico completo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Quitação de Dívida (Phase 6) */}
      {settlementSale && (
          <SettlementModal
              isOpen={!!settlementSale}
              onClose={() => setSettlementSale(null)}
              saleId={settlementSale.id}
              saleTotal={settlementSale.total}
              customerName={settlementSale.customerName}
          />
      )}

      {/* Modal de Recibo / Fiscal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setFiscalResponseData(null); // Limpa dados fiscais ao fechar
        }}
        saleId={selectedSaleId}
        initialFiscalData={fiscalResponseData}
      />

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
              <span className="text-brand">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="bg-surface/50 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
