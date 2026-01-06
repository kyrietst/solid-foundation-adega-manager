import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { useSettlePayment } from '@/features/sales/hooks/useSalesMutations';
import { Loader2, DollarSign } from 'lucide-react';
import { usePaymentMethods } from '@/features/sales/hooks/use-sales';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  saleTotal: number;
  customerName?: string;
}

export function SettlementModal({ isOpen, onClose, saleId, saleTotal, customerName }: SettlementModalProps) {
  const [method, setMethod] = useState<string>('');
  const { mutate: settle, isPending } = useSettlePayment();
  const { data: paymentMethods = [] } = usePaymentMethods();

  const handleSettle = () => {
    if (!saleId || !method) return;

    settle(
      { saleId, paymentMethod: method },
      {
        onSuccess: () => {
          onClose();
          setMethod('');
        }
      }
    );
  };

  // Filter out 'Fiado' from payment methods for settlement
  const availableMethods = paymentMethods.filter(pm => pm.slug !== 'fiado' && pm.name.toLowerCase() !== 'fiado');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-6 w-6 text-green-500" />
            Quitar Dívida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
               <span>Cliente:</span>
               <span className="text-white font-medium">{customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
               <span className="text-gray-300">Total a Pagar:</span>
               <span className="text-green-400">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleTotal || 0)}
               </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Como o pagamento foi recebido?</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o meio de pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                {availableMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.name}>
                    {pm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Cancelar
          </Button>
          <Button 
            onClick={handleSettle} 
            disabled={!method || isPending}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Confirmar Pagamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
