import { useSales, useDeleteSale } from "@/hooks/use-sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Download, CalendarDays, CreditCard, ChevronRight, User, Truck, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SaleStatus = 'completed' | 'pending' | 'cancelled' | 'returned';
type PaymentStatus = 'pending' | 'paid' | 'cancelled';

interface Sale {
  id: string;
  status: SaleStatus;
  payment_status: PaymentStatus;
  created_at: string;
  payment_method: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  delivery: boolean;
  delivery_address?: string | null;
  customer_id: string | null;
  seller_id: string;
  notes: string | null;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  seller?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  // seller_id já está definido acima na interface
  items?: Array<{
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: {
      name: string;
      barcode?: string;
    };
  }>;
}

export function RecentSales() {
  const { data: sales, isLoading } = useSales({ limit: 5 });
  const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();
  const { user, userRole } = useAuth();
  const [saleToDelete, setSaleToDelete] = useState<{id: string, number: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Alterna a exibição dos detalhes da venda
  const toggleSaleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const handleDeleteClick = (saleId: string, saleNumber: string) => {
    setSaleToDelete({ id: saleId, number: saleNumber });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!saleToDelete) return;
    
    deleteSale(saleToDelete.id);
    
    // Mostra mensagem de sucesso (o hook useDeleteSale já mostra a mensagem)
    toast({
      title: "Sucesso",
      description: `Venda #${saleToDelete.number} excluída com sucesso.`,
    });
    
    setIsDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSaleToDelete(null);
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

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const formatPaymentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vendas Recentes</h2>
          <p className="text-sm text-muted-foreground">
            Visualize as últimas transações realizadas
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
      
      {sales?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma venda encontrada</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
            Quando você realizar vendas, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales?.map((sale) => (
            <div 
              key={sale.id} 
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      Venda #{sale.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(sale.status)}`}
                    >
                      {
                        (() => {
                          const status = sale.status.toLowerCase();
                          switch(status) {
                            case 'completed': return 'Concluído';
                            case 'pending': return 'Pendente';
                            case 'cancelled':
                            case 'canceled': return 'Cancelado';
                            case 'returned': return 'Devolvido';
                            default: return status.charAt(0).toUpperCase() + status.slice(1);
                          }
                        })()
                      }
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{formatPaymentMethod(sale.payment_method)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatPaymentStatus(sale.payment_status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Vendedor: {sale.seller?.name || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Cliente: {sale.customer?.name || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xl font-bold text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(Number(sale.final_amount || sale.total_amount || 0))}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-primary hover:text-primary/90"
                      onClick={() => toggleSaleDetails(sale.id)}
                    >
                      {expandedSaleId === sale.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </Button>
                    {userRole === 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(sale.id, sale.id.slice(0, 8).toUpperCase())}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Detalhes expandidos da venda */}
              {expandedSaleId === sale.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Itens da venda:</h4>
                  {sale.items && sale.items.length > 0 ? (
                    <div className="space-y-2">
                      {sale.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.quantity}x</span> {item.product?.name || 'Produto não encontrado'}
                          </div>
                          <div>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL"
                            }).format(Number(item.subtotal || 0))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum item encontrado nesta venda.</p>
                  )}
                  
                  {sale.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium mb-1">Observações:</h4>
                      <p className="text-sm text-muted-foreground">{sale.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center pt-2">
        <Button variant="outline" size="sm" className="gap-2">
          Ver histórico completo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a venda #{saleToDelete?.number}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
