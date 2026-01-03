/**
 * EditCustomerModal.tsx - Modal para edição de clientes
 * Wrapper simplificado que usa o CustomerForm refatorado
 * 
 * @author Adega Manager Team
 * @version 2.0.0
 */

import React from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { CustomerForm } from './CustomerForm';
import { Edit } from 'lucide-react';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: { id: string; name: string } | null;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!customer) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={<><Edit className="h-5 w-5 text-blue-400" /> Editar Cliente</>}
      description={`Atualize os dados de ${customer.name}`}
      size="2xl"
      className="max-h-content-2xl overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >
      <div className="p-1">
        <CustomerForm 
          customerId={customer.id} 
          onSuccess={onClose} 
        />
      </div>
    </BaseModal>
  );
};

export default EditCustomerModal;