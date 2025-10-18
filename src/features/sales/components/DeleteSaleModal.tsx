import { useState } from 'react';
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
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";

interface DeleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saleOrderNumber: number;
  isDeleting: boolean;
}

export function DeleteSaleModal({
  isOpen,
  onClose,
  onConfirm,
  saleOrderNumber,
  isDeleting
}: DeleteSaleModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');

  const handleConfirm = () => {
    if (confirmationInput === saleOrderNumber.toString()) {
      onConfirm();
      setConfirmationInput('');
    }
  };

  const handleClose = () => {
    setConfirmationInput('');
    onClose();
  };

  const isConfirmDisabled = confirmationInput !== saleOrderNumber.toString() || isDeleting;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-red-500/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-400">
            Confirmar Exclusão de Venda
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-gray-300 space-y-3">
              <p className="font-medium">
                Esta ação é <span className="text-red-400 font-bold">IRREVERSÍVEL</span> e irá:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Excluir permanentemente a venda #{saleOrderNumber}</li>
                <li>Remover todos os itens da venda</li>
                <li>Restaurar o estoque dos produtos</li>
                <li>Atualizar o histórico do cliente</li>
              </ul>
              <div className="mt-4 space-y-2">
                <Label htmlFor="confirmation" className="text-yellow-400 font-semibold">
                  Para confirmar, digite o número da venda:{' '}
                  <span className="text-white font-mono">{saleOrderNumber}</span>
                </Label>
                <Input
                  id="confirmation"
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={`Digite ${saleOrderNumber} para confirmar`}
                  className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-400"
                  disabled={isDeleting}
                  autoFocus
                />
                {confirmationInput && confirmationInput !== saleOrderNumber.toString() && (
                  <p className="text-xs text-red-400">
                    O número digitado não corresponde ao número da venda
                  </p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            disabled={isDeleting}
            className="bg-gray-800 hover:bg-gray-700 text-white border-white/10"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
