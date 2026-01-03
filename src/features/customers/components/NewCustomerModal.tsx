/**
 * NewCustomerModal.tsx - Modal para cadastro de novos clientes
 * Refatorado para usar o CustomerForm centralizado
 * 
 * @author Adega Manager Team
 * @version 2.0.0
 */

import React from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { CustomerForm } from './CustomerForm';
import { UserPlus } from 'lucide-react';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={<><UserPlus className="h-5 w-5 text-green-400" /> Novo Cliente</>}
      description="Cadastre um novo cliente no sistema"
      size="2xl"
      className="max-h-content-2xl overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >
      <div className="p-1">
        <CustomerForm onSuccess={onClose} />
      </div>
    </BaseModal>
  );
};

export default NewCustomerModal;