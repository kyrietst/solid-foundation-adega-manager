import { useSales, useDeleteSale } from "@/features/sales/hooks/use-sales";
import { Skeleton } from "@/shared/ui/composite/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { Button } from "@/shared/ui/primitives/button";
import { 
  FileText, 
  ChevronDown, 
  ChevronUp,
  User, 
  Truck, 
  Trash2, 
  Package, 
  Store, 
  QrCode,
  ShoppingBag,
  DollarSign,
  Ban,
  Receipt,
  CreditCard
} from "lucide-react";
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

import { SettlementModal } from './SettlementModal';
import { useFiscalEmission, FiscalResponse } from "@/features/fiscal/hooks/useFiscalEmission";
import { LoadingSpinner } from "@/shared/ui/composite/loading-spinner";
import { ReceiptModal } from "./ReceiptModal";

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
  const [saleToDelete, setSaleToDelete] = useState<{ id: string, number: number, isFiscal: boolean } | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
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

  const toggleSaleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const handleDeleteClick = (saleId: string, saleNumber: number, isFiscal: boolean) => {
    setSaleToDelete({ id: saleId, number: saleNumber, isFiscal });
    setCancellationReason(""); // Reset reason
    setIsDeleteDialogOpen(true);
  };

  const handleEmitFiscal = async (saleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processingSaleId) return;

    setProcessingSaleId(saleId);
    await emitInvoice(saleId, (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
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

    if (saleToDelete.isFiscal && cancellationReason.length < 15) {
        toast({
            title: "Justificativa Curta",
            description: "Para nota fiscal, a justificativa deve ter pelo menos 15 caracteres.",
            variant: "destructive",
        });
        return;
    }

    deleteSale({ saleId: saleToDelete.id, user, manualReason: cancellationReason }, {
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
          description: error.message || "Não foi possível excluir a venda. Tente novamente.",
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
    navigate('/movements');
  };

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

  return (
    <div className="flex flex-col h-full space-y-4 pr-2">
       {/* Main Content Area */}
       {isLoading ? (
         <div className="space-y-4">
           {[...Array(5)].map((_, i) => (
             <Skeleton key={i} className="h-24 w-full rounded-xl bg-zinc-900/50" />
           ))}
         </div>
       ) : sales?.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/40 border border-white/5 backdrop-blur-xl rounded-xl">
            <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
               <ShoppingBag className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-300">
              Nenhuma venda encontrada
            </h3>
            <p className="text-sm text-center max-w-md mt-1 text-zinc-500">
              As transações recentes aparecerão aqui.
            </p>
          </div>
       ) : (
          /* Sales List */
          <div className="flex-1 w-full space-y-4 overflow-y-auto pr-1 pb-20 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {sales?.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;
              const isCancelled = sale.status === 'cancelled';
              const isPending = sale.payment_status === 'pending';
              const isPaid = sale.payment_status === 'paid';
              const isDelivery = sale.delivery_type === 'delivery';

              return (
                <div 
                    key={sale.id}
                    className={cn(
                        "group relative flex flex-col rounded-xl transition-all duration-300 border backdrop-blur-xl",
                        isCancelled 
                            ? "bg-red-950/10 border-red-500/10 hover:bg-red-950/20" 
                            : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                    )}
                >
                    {/* Main Row Content */}
                    <div className="flex flex-col lg:flex-row gap-4 p-5 items-start lg:items-center justify-between">
                        
                        {/* 1. Identity Section */}
                        <div className="flex items-start gap-4 min-w-[280px]">
                            {/* Icon Box */}
                            <div className={cn(
                                "flex items-center justify-center rounded-xl shrink-0 w-12 h-12 border transition-all duration-300",
                                isCancelled ? "bg-red-500/10 text-red-500 border-red-500/10" :
                                isPending ? "bg-rose-500/10 text-rose-500 border-rose-500/10 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                isDelivery ? "bg-amber-500/10 text-amber-400 border-amber-500/10 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/10 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                            )}>
                                {isCancelled ? <Ban className="h-6 w-6" /> :
                                 isDelivery ? <Truck className="h-6 w-6" /> : 
                                 <Store className="h-6 w-6" />}
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-lg font-bold tracking-tight",
                                        isCancelled ? "text-zinc-500 line-through" : "text-zinc-100"
                                    )}>
                                        {isDelivery ? 'Pedido' : 'Venda'} #{sale.order_number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {/* Status Badge */}
                                    {isCancelled ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                            Cancelado
                                        </span>
                                    ) : isPending ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                            Pendente
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Pago
                                        </span>
                                    )}

                                    {/* Actions Required Badge (Payment) */}
                                    {isPending && !isCancelled && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenSettlement(sale); }}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                                        >
                                            <DollarSign className="w-3 h-3" />
                                            Quitar
                                        </button>
                                    )}

                                    {/* Fiscal Badge */}
                                    {sale.invoice && sale.invoice.status === 'authorized' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                            NFC-e Emitida
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                                            S/ Nota
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Metadata Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 text-sm w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                            <div className="flex flex-col">
                                <span className="text-zinc-500 text-xs">Data</span>
                                <span className="text-zinc-300 font-medium">
                                    {formatDate(sale.created_at)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-zinc-500 text-xs">Vendedor</span>
                                <span className="text-zinc-300 truncate">
                                    {sale.seller?.name?.split(' ')[0] || 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-zinc-500 text-xs">Cliente / Entrega</span>
                                <div className="flex flex-col">
                                    <span className="text-zinc-300 truncate font-medium" title={sale.customer?.name || 'Consumidor Final'}>
                                        {sale.customer?.name 
                                            ? (sale.customer.name.length > 15 ? sale.customer.name.substring(0, 15) + '...' : sale.customer.name)
                                            : 'Consumidor Final'}
                                    </span>
                                    
                                    {/* Delivery Info Snippet */}
                                    {isDelivery && (
                                        <div className="flex flex-col mt-0.5 space-y-0.5">
                                            {sale.delivery_fee > 0 && (
                                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                                    + {formatCurrency(sale.delivery_fee)} (Entrega)
                                                </span>
                                            )}
                                            {sale.delivery_address && (
                                                <span className="text-[10px] text-zinc-500 truncate max-w-[140px]" title={`${sale.delivery_address.street}, ${sale.delivery_address.neighborhood}`}>
                                                    {sale.delivery_address.neighborhood || 'Endereço não inf.'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-zinc-500 text-xs">Método</span>
                                <div className="flex items-center gap-1 text-zinc-300">
                                    <CreditCard className="w-3 h-3 opacity-70" />
                                    <span className="truncate">{formatPaymentMethod(sale.payment_method)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Totals & Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-white/5">
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs mb-0.5">Total</p>
                                <p className={cn(
                                    "text-lg font-bold",
                                    isCancelled ? "text-zinc-500 line-through decoration-red-500/50" : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                                )}>
                                    {formatCurrency(sale.final_amount || sale.total_amount)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Fiscal Action */}
                                {sale.invoice && sale.invoice.status === 'authorized' ? (
                                     <button 
                                        className="p-2 text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                        title="Ver NFC-e"
                                        onClick={(e) => handleViewFiscal(sale.invoice!.pdf_url || '', e)}
                                    >
                                        <Receipt className="w-5 h-5" />
                                    </button>
                                ) : (
                                    !isCancelled && (
                                        <button 
                                            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                                            title="Emitir Cupom Fiscal"
                                            onClick={(e) => handleEmitFiscal(sale.id, e)}
                                            disabled={isFiscalProcessing && processingSaleId === sale.id}
                                        >
                                            {isFiscalProcessing && processingSaleId === sale.id ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <QrCode className="w-5 h-5" />
                                            )}
                                        </button>
                                    )
                                )}

                                {/* Cancel Action */}
                                {((userRole as string) === 'admin' || (userRole as string) === 'employee' || (userRole as string) === 'manager') && !isCancelled && (
                                    <button 
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Cancelar Venda"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(sale.id, sale.order_number, sale.invoice?.status === 'authorized'); }}
                                    >
                                        <Ban className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Expand Toggle */}
                                <button 
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isExpanded ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                    title={isExpanded ? "Recolher" : "Expandir"}
                                    onClick={() => toggleSaleDetails(sale.id)}
                                >
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                       <div className="border-t border-white/5 bg-black/40 p-4 lg:px-6 lg:pb-6 rounded-b-xl animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="flex items-center justify-between mb-4">
                               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Itens da Venda</h3>
                           </div>
                           
                           <div className="overflow-hidden rounded-lg border border-white/5 bg-zinc-900/30">
                               <table className="w-full text-left border-collapse">
                                   <thead className="bg-white/5 text-zinc-400 text-xs uppercase font-semibold">
                                       <tr>
                                           <th className="px-4 py-3 font-medium">Produto</th>
                                           <th className="px-4 py-3 font-medium text-center w-24">Qtd</th>
                                           <th className="px-4 py-3 font-medium text-right w-32">Valor Unit.</th>
                                           <th className="px-4 py-3 font-medium text-right w-32">Subtotal</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-white/5 text-sm">
                                       {sale.items?.map((item) => (
                                           <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                               <td className="px-4 py-3 text-zinc-300">
                                                   <div className="flex items-center gap-3">
                                                       <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-600">
                                                            <Package className="w-4 h-4" />
                                                       </div>
                                                       <span>{item.product?.name || 'Item desconhecido'}</span>
                                                   </div>
                                               </td>
                                               <td className="px-4 py-3 text-center text-zinc-400">{item.quantity}</td>
                                               <td className="px-4 py-3 text-right text-zinc-400">{formatCurrency(item.unit_price)}</td>
                                               <td className="px-4 py-3 text-right text-zinc-100 font-medium">{formatCurrency(item.subtotal)}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                           
                           <div className="mt-4 flex flex-col md:flex-row justify-between gap-6 text-sm text-zinc-400 border-t border-white/5 pt-4">
                               <div className="flex-1">
                                    {sale.notes && (
                                        <div className="bg-zinc-800/30 rounded p-3 border border-white/5">
                                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Observações</p>
                                            <p className="text-zinc-300 italic">"{sale.notes}"</p>
                                        </div>
                                    )}
                               </div>
                               <div className="min-w-[200px] space-y-2">
                                   <div className="flex justify-between gap-8">
                                       <span>Subtotal</span>
                                       <span>{formatCurrency(sale.total_amount)}</span>
                                   </div>
                                    {/* Exibir Taxa de Entrega no Resumo Completo também */}
                                   {isDelivery && sale.delivery_fee > 0 && (
                                        <div className="flex justify-between gap-8 text-amber-400/80">
                                            <span>Taxa de Entrega</span>
                                            <span>+ {formatCurrency(sale.delivery_fee)}</span>
                                        </div>
                                   )}
                                   <div className="flex justify-between gap-8">
                                       <span>Desconto</span>
                                       <span>{formatCurrency(sale.discount_amount || 0)}</span>
                                   </div>
                                   <div className="flex justify-between gap-8 font-bold text-white text-base">
                                       <span>Total Final</span>
                                       <span>{formatCurrency(sale.final_amount)}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                    )}
                </div>
              );
            })}

            {/* View Full History Button - Preserved */}
            <div className="flex justify-center pt-6 pb-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-zinc-500 hover:text-white transition-all duration-300 hover:bg-white/5"
                onClick={handleViewFullHistory}
              >
                <div className="animate-pulse">
                     <ChevronDown className="h-4 w-4" />
                </div>
                Carregar histórico completo
              </Button>
            </div>
          </div>
       )}

       {/* Modais */}
       {settlementSale && (
           <SettlementModal
               isOpen={!!settlementSale}
               onClose={() => setSettlementSale(null)}
               saleId={settlementSale.id}
               saleTotal={settlementSale.total}
               customerName={settlementSale.customerName}
           />
       )}

       {/* Receipt Modal */}
       <ReceiptModal
         isOpen={receiptModalOpen}
         onClose={() => {
           setReceiptModalOpen(false);
           setFiscalResponseData(null);
         }}
         saleId={selectedSaleId}
         initialFiscalData={fiscalResponseData}
       />

       {/* AlertDialog - Delete/Cancel */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent className="bg-zinc-900 border-white/10">
           <AlertDialogHeader>
             <AlertDialogTitle className="text-white">
                 {saleToDelete?.isFiscal ? 'Cancelar Nota Fiscal' : 'Cancelar Venda'}
             </AlertDialogTitle>
             <AlertDialogDescription className="text-zinc-400">
               {saleToDelete?.isFiscal ? (
                   <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4 text-red-300">
                     <strong>Atenção:</strong> Esta venda possui Nota Fiscal Autorizada.
                     O cancelamento será enviado para a SEFAZ e é irreversível.
                   </div>
               ) : (
                   'Tem certeza que deseja cancelar esta venda?'
               )}
               
               <div className="mt-2 space-y-2">
                   <p>
                     Pedido #{saleToDelete?.number} - {saleToDelete?.isFiscal ? 'Estorno Fiscal + Estoque' : 'Estorno de Estoque'}
                   </p>
                   
                   {saleToDelete?.isFiscal && (
                       <div className="mt-4">
                           <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">
                             Justificativa (Obrigatório, min. 15 caracteres)
                           </label>
                           <textarea
                               className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-24"
                               placeholder="Motivo do cancelamento (ex: Erro no preenchimento de valores)"
                               value={cancellationReason}
                               onChange={(e) => setCancellationReason(e.target.value)}
                           />
                           <p className="text-right text-[10px] text-zinc-500 mt-1">
                               {cancellationReason.length}/15
                           </p>
                       </div>
                   )}

                   {!saleToDelete?.isFiscal && (
                      <div className="mt-4">
                           <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">
                             Justificativa (Opcional)
                           </label>
                           <textarea
                               className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-brand/50 resize-none h-20"
                               placeholder="Motivo do cancelamento..."
                               value={cancellationReason}
                               onChange={(e) => setCancellationReason(e.target.value)}
                           />
                       </div>
                   )}
               </div>
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel
               onClick={handleCancelDelete}
               disabled={isDeleting}
               className="bg-zinc-800 border-white/10 text-white hover:bg-zinc-700"
             >
               Voltar
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleConfirmDelete}
               className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
               disabled={isDeleting}
             >
               {isDeleting ? (
                 <div className="flex items-center gap-2">
                   <LoadingSpinner size="sm" color="white" />
                   {saleToDelete?.isFiscal ? 'Aguardando SEFAZ...' : 'Cancelando...'}
                 </div>
               ) : (
                 'Confirmar Cancelamento'
               )}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
