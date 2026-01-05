/**
 * NewCustomerModal.tsx - Modal para cadastro de novos clientes
 * Refatorado para usar o CustomerForm centralizado
 * 
 * @author Adega Manager Team
 * @version 2.0.0
 */

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/primitives/sheet";
import { CustomerForm } from './CustomerForm';
import { UserPlus } from 'lucide-react';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] overflow-y-auto bg-black/95 backdrop-blur-md border-l border-white/10 p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-white/10 bg-black/50 sticky top-0 z-50 backdrop-blur-sm">
            <SheetTitle className="text-2xl font-bold text-primary-yellow flex items-center gap-2">
              <UserPlus className="h-6 w-6" /> Novo Cliente
            </SheetTitle>
            <div className="text-gray-400 text-sm">Cadastre um novo cliente no sistema</div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CustomerForm onSuccess={onClose} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewCustomerModal;