import { useState, useMemo } from 'react';
import { useCart, useCartTotal } from '@/hooks/use-cart';
import { useCustomer } from '@/hooks/use-crm';
import { usePaymentMethods, useUpsertSale } from '@/hooks/use-sales';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

import { CustomerSearch } from './CustomerSearch';
import { CustomerForm } from '@/components/clients/CustomerForm';
import { Loader2, ShoppingCart, Trash2, UserPlus } from 'lucide-react';

export function Cart() {
  const { items, updateItemQuantity, removeItem, customerId, setCustomer, clearCart } = useCart();
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  const { data: selectedCustomer } = useCustomer(customerId || '');
  
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  const { toast } = useToast();
  const subtotal = useCartTotal();
  const upsertSale = useUpsertSale();

  const total = useMemo(() => {
    const calculatedTotal = subtotal - discount;
    return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, discount]);

  const handleFinishSale = () => {
    if (items.length === 0) {
      toast({ title: 'Carrinho vazio', description: 'Adicione produtos para iniciar uma venda.', variant: 'destructive' });
      return;
    }
    if (!paymentMethodId) {
      toast({ title: 'Forma de pagamento não selecionada', description: 'Selecione uma forma de pagamento.', variant: 'destructive' });
      return;
    }

    upsertSale.mutate(
      {
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        total_amount: total,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity, unit_price: item.price }))
      },
      {
        onSuccess: () => {
          toast({ title: 'Venda finalizada!', description: 'A venda foi registrada com sucesso.' });
          clearCart();
          setDiscount(0);
          setPaymentMethodId('');
        },
        onError: (error) => {
          toast({ title: 'Erro ao finalizar a venda', description: error.message, variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="flex h-full flex-col bg-card border-l">
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Carrinho de Vendas
        </h2>
      </header>

      <section className="flex-1 overflow-y-auto p-4 space-y-4">
        <CustomerSearch
          selectedCustomer={selectedCustomer || null}
          onSelect={(customer) => setCustomer(customer?.id || null)}
          onAddNew={() => setIsCustomerModalOpen(true)}
        />

        <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={() => setIsCustomerModalOpen(false)} />
          </DialogContent>
        </Dialog>

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">Seu carrinho está vazio</h3>
            <p className="text-sm">Adicione produtos da grade ao lado para começar.</p>
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-2">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="h-8 w-16 text-center"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </section>

      {items.length > 0 && (
        <footer className="p-4 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
               <Input
                  type="number"
                  placeholder="Desconto (R$)"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="h-9"
                />
                <Button variant="outline" size="sm" onClick={() => setDiscount(0)} disabled={discount === 0}>Remover</Button>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Select onValueChange={setPaymentMethodId} value={paymentMethodId}>
              <SelectTrigger disabled={isLoadingPaymentMethods}>
                <SelectValue placeholder={isLoadingPaymentMethods ? 'Carregando...' : 'Selecione o pagamento'} />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFinishSale}
            disabled={upsertSale.isPending || !paymentMethodId}
            className="w-full h-12 text-lg"
          >
            {upsertSale.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizando...</>
            ) : (
              `Finalizar Venda (${formatCurrency(total)})`
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
