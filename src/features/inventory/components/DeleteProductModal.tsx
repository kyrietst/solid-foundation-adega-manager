/**
 * DeleteProductModal Component
 * Design: Tactical Stitch (Standardized)
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import {
  AlertTriangle,
  Trash2,
  Package,
  Copy,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import useProductDelete from '../hooks/useProductDelete';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string;
  onSuccess?: () => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [copied, setCopied] = useState(false);

  const { softDelete, isDeleting } = useProductDelete();

  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!productId || !productName) return;

    try {
      onClose();
      await softDelete({ productId, productName });
      onSuccess?.();
    } catch (error) {
      console.error('Erro na operação:', error);
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(productName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canConfirm = () => {
    return confirmationText.trim() === (productName || '').trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border border-white/5 p-0 overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                 <Trash2 className="h-6 w-6 text-rose-500" />
                 <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                    EXCLUIR PRODUTO
                 </DialogTitle>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-9">
                 Danger Zone Operation
              </span>
           </div>
           
           <button 
              onClick={onClose} 
              className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
           >
              <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
           </button>
        </div>

        <div className="p-8 space-y-6 bg-zinc-900/10">
          {/* Target Product */}
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <Package className="h-6 w-6 text-amber-500" />
             </div>
             <div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Produto Alvo</p>
               <h3 className="text-lg font-bold text-white">{productName}</h3>
             </div>
          </div>

          {/* Warning */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertDescription className="text-blue-200/80 text-sm">
              <strong>Soft Delete:</strong> O produto será marcado como inativo. O histórico financeiro será preservado.
            </AlertDescription>
          </Alert>

          {/* Confirmation Input */}
          <div className="space-y-4">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 relative group">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Nome para confirmação</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyName}
                    className="h-6 w-6 p-0 text-zinc-500 hover:text-white hover:bg-white/10"
                    title="Copiar nome"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
               </div>
               <p className="text-lg font-bold text-white font-mono select-all break-all tracking-tight">
                 {productName}
               </p>
            </div>

            <div className="relative">
               <Input
                 type="text"
                 value={confirmationText}
                 onChange={(e) => setConfirmationText(e.target.value)}
                 placeholder="Digite o nome do produto para confirmar..."
                 className={cn(
                   "bg-zinc-950 border-white/10 text-white h-12 transition-all font-mono text-sm placeholder:text-zinc-700 focus:ring-0",
                   confirmationText && !canConfirm() && "border-rose-500/50 focus:border-rose-500",
                   canConfirm() && "border-emerald-500/50 focus:border-emerald-500"
                 )}
                 disabled={isDeleting}
                 autoComplete="off"
               />
               {confirmationText && !canConfirm() && (
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-rose-500 pointer-events-none">
                    <span className="text-[10px] font-bold uppercase">Incorreto</span>
                    <AlertTriangle className="h-4 w-4" />
                 </div>
               )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t border-white/5 bg-zinc-900/50 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!canConfirm() || isDeleting}
            className={cn(
              "rounded-full px-8 py-6 font-bold tracking-wide shadow-lg transition-all",
              canConfirm() 
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]" 
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                CONFIRMAR EXCLUSÃO
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductModal;
